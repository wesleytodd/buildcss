'use strict'
const { suite, test, beforeEach } = require('mocha')
const rimraf = require('rimraf')
const path = require('path')
const assert = require('assert')
const buildcss = require('../')
const FIXTURES = path.join(__dirname, 'fixtures')

suite('build css', () => {
  beforeEach((done) => {
    rimraf(path.join(FIXTURES, 'dist'), done)
  })

  test('should bundle a file', async () => {
    const filename = await buildcss({
      debug: true,
      basedir: FIXTURES
    })

    // Test filename
    assert(filename)
    assert(filename.includes('index-'))
    assert(filename.includes('.css'))
  })

  test('should resolve relative paths correctly', async () => {
    const filename = await buildcss({
      debug: true,
      basedir: FIXTURES,
      srcfile: 'index.css',
      outputdir: 'dist'
    })

    // Test filename
    assert(filename)
    assert(filename.includes('index-'))
    assert(filename.includes('.css'))
  })

  test('should resolve absolute paths correctly', async () => {
    const filename = await buildcss({
      debug: true,
      basedir: FIXTURES,
      srcfile: path.join(FIXTURES, 'index.css'),
      outputdir: path.join(FIXTURES, 'dist')
    })

    // Test filename
    assert(filename)
    assert(filename.includes('index-'))
    assert(filename.includes('.css'))
  })
})
