'use strict'

const t = require('tap')
require('tap-given')(t)

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const mockFs = require('mock-fs')

const fs = require('fs')

const { FsBlobStorage } = require('../lib/fs-blob-storage')

const path = require('path')
const PromiseReadable = require('promise-readable')
const PromiseWritable = require('promise-writable')
const { Readable, Writable } = require('stream')

const STORAGEDIR = '/tmp/storage'

Feature('Test FsBlobStorage with ext option', () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      'commit.txt.part': 'another file content here',
      'read.txt': 'file content here',
      'remove.txt': 'more file content here'
    }
  }

  Scenario('FsBlobStorage produces write stream', () => {
    const testKey = 'write'
    const realFilename = path.join(STORAGEDIR, testKey + '.txt.part')

    let storage
    let writable

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key test is passed in', () => {
      return storage.createWriteStream(testKey, { ext: '.txt' })
        .then((value) => {
          writable = value
        })
    })

    Then('created Writable should not be null', () => {
      writable.should.be.an.instanceof(Writable)
    })

    And('.part file should be created', () => {
      return fs.existsSync(realFilename).should.be.true
    })

    When('I write to the Writable stream', () => {
      const promiseWritable = new PromiseWritable(writable)
      return promiseWritable.writeAll('new content here')
    })

    Then('new file contains the new content', () => {
      const content = fs.readFileSync(realFilename, { encoding: 'utf8' })
      content.should.deep.equal('new content here')
    })

    After(() => {
      mockFs.restore()
    })
  })

  Scenario('FsBlobStorage produces read stream', () => {
    const testKey = 'read'

    let readable
    let storage

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key test is passed in', () => {
      return storage.createReadStream(testKey, { ext: '.txt' })
        .then((value) => {
          readable = value
        })
    })

    Then('created Readable should not be null', () => {
      readable.should.be.an.instanceof(Readable)
    })

    And('Readable should contain the content', () => {
      const promiseReadable = new PromiseReadable(readable)
      return promiseReadable.read().should.eventually.equal('file content here')
    })

    After(() => {
      mockFs.restore()
    })
  })

  Scenario('FsBlobStorage commits file', () => {
    const testKey = 'commit'
    const realFilename = path.join(STORAGEDIR, testKey + '.txt')

    let storage

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key rs is passed in', () => {
      return storage.commit(testKey, { ext: '.txt' })
    })

    Then('rs.part should be renamed to rs', () => {
      return fs.existsSync(realFilename).should.be.true
    })

    After(() => {
      mockFs.restore()
    })
  })

  Scenario('FsBlobStorage removes file', () => {
    const testKey = 'remove'
    const realFilename = path.join(STORAGEDIR, testKey + '.txt')

    let storage

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key remove is passed in', () => {
      return storage.remove(testKey, { ext: '.txt' })
    })

    Then('remove should be removed', () => {
      return fs.existsSync(realFilename).should.be.false
    })

    After(() => {
      mockFs.restore()
    })
  })
})
