# Build CSS

This is a way I have built css files.  Take it or leave it.

## Usage

```
$ npm in @wesleytodd/buildcss
```

Without any options it will build `index.css` to `dist/index-{filehash}.css`:

```javascript
const buildcss = require('@wesleytodd/buildcss')

(async () => {
  await buildcss()
})()
```

### Options

```javascript
// these are the defaults
buildcss({
  basedir: process.cwd(),
  srcfile: 'index.css',
  outputdir: 'dist',
  outputFilename: 'index-{{hash}}.css',
  outputMapFilename: 'index-{{hash}}.css.map',
  outputMapUrl: 'index-{{hash}}.css.map',
  debug: false,
  watch: false,
  minify: false
})
```
