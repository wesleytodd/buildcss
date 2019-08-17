'use strict'
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Loggerr = require('loggerr')
const cliFormatter = require('loggerr/formatters/cli')
const mkdirp = require('mkdirp')
const postcss = require('postcss')
const precss = require('precss')
const autoprefixer = require('autoprefixer')
const atImport = require('postcss-import')
const cssNano = require('cssnano')
const chokidar = require('chokidar')

module.exports = function buildCss (options) {
  const opts = options || {}

  // Set defaults
  opts.basedir = opts.basedir || process.cwd()
  opts.srcfile = path.resolve(opts.basedir, opts.srcfile || 'index.css')
  opts.outputdir = path.resolve(opts.basedir, opts.outputdir || 'dist')
  opts.outputFilename = path.resolve(opts.outputdir, opts.outputFilename || 'index-{{hash}}.css')
  opts.outputMapFilename = path.resolve(opts.outputdir, opts.outputMapFilename || 'index-{{hash}}.css.map')
  opts.outputMapUrl = opts.outputMapUrl || opts.outputMapFilename || 'index-{{hash}}.css.map'
  opts.debug = opts.debug || false
  opts.watch = opts.watch || false
  opts.minify = opts.minify || false

  // Create loggerr
  const log = opts.logger || new Loggerr({
    formatter: cliFormatter,
    level: opts.debug ? Loggerr.DEBUG : Loggerr.NOTICE
  })

  const bundle = postcss([
    atImport(),
    precss(),
    autoprefixer()
  ])

  if (opts.minify) {
    bundle.use(cssNano({
      preset: 'default'
    }))
  }

  const bundler = createBundler(bundle, log, opts)

  // Run the bundle
  return bundler().then(({ outputFile, files }) => {
    // Setup a watcher
    if (opts.watch) {
      createWatcher(files, log, bundler)
    }

    return outputFile
  })
}

function createBundler (bundle, log, opts) {
  return function () {
    return new Promise((resolve, reject) => {
      log.info('starting css bundle')
      fs.readFile(opts.srcfile, (err, css) => {
        if (err) {
          return reject(err)
        }

        bundle.process(css, {
          from: opts.srcfile,
          to: opts.outputFilename,
          map: {
            inline: false
          }
        })
          .then((result) => {
            // Hash the file
            const hash = crypto.createHash('sha256').update(result.css).digest('hex')
            const out = opts.outputFilename.replace('{{hash}}', hash)
            const map = opts.outputMapFilename.replace('{{hash}}', hash)

            const outUrl = opts.outputMapUrl.replace('{{hash}}', hash)
            result.css = result.css.replace(`/*# sourceMappingURL=${path.relative(opts.outputdir, opts.outputMapFilename)}`, `/*# sourceMappingURL=${outUrl}`)

            // Write files
            mkdirp(path.dirname(out), (err) => {
              if (err) {
                return reject(err)
              }

              fs.writeFile(out, result.css, (err) => {
                if (err) {
                  return reject(err)
                }
                log.notice(`wrote: ${path.relative(opts.outputdir, out)}`)

                fs.writeFile(map, result.map, (err) => {
                  if (err) {
                    return reject(err)
                  }
                  log.notice(`wrote: ${path.relative(opts.outputdir, map)}`)

                  resolve({
                    outputFile: out,
                    // Get all the files so we can watch them if we have to
                    files: result.messages.reduce((files, msg) => {
                      if (msg.type === 'dependency') {
                        files.push(msg.file)
                      }
                      return files
                    }, [opts.srcfile])
                  })
                })
              })
            })
          })
      })
    })
  }
}

function createWatcher (files, log, bundler) {
  const watcher = chokidar.watch(files)
    .on('error', (err) => { log.error(`Watcher error: ${err}`) })
    .on('change', () => {
      watcher.close()
      bundler().then(({ files }) => {
        createWatcher(files, log, bundler)
      })
    })
}
