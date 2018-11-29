/* eslint-env mocha */
'use strict'
const rimraf = require('rimraf')
const path = require('path')
const assert = require('assert')
const buildcss = require('../')
const FIXTURES = path.join(__dirname, 'fixtures')

describe('build css', () => {
  before((done) => {
    rimraf(path.join(FIXTURES, 'dist'), done)
  })

  it('should bundle a file', async () => {
    const filename = await buildcss({
      debug: true,
      basedir: FIXTURES
    })

    // Test filename
    assert(filename)
    assert(filename.includes('index-'))
    assert(filename.includes('.css'))
  })
})
