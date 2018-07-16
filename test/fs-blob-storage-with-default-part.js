'use strict'

const t = require('tap')
require('tap-given')(t)

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const mockFs = require('../mock/mock-fs')

const { FsBlobStorage } = require('../lib/fs-blob-storage')

const path = require('path')
const PromiseReadable = require('promise-readable')
const PromiseWritable = require('promise-writable')
const { Readable, Writable } = require('stream')

const STORAGEDIR = '/tmp/storage'

Feature('Test FsBlobStorage with defaultPart option', () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      'commit.txt.lock': 'another file content here',
      'read.txt': 'file content here',
      'remove.txt': 'more file content here'
    }
  }

  Scenario('FsBlobStorage produces write stream', () => {
    const testKey = 'write'
    const realFilename = path.join(STORAGEDIR, testKey + '.txt.lock')

    let storage
    let writable

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, defaultPart: '.lock', fs: mockFs })
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
      return mockFs.existsSync(realFilename).should.be.true
    })

    When('I write to the Writable stream', () => {
      const promiseWritable = new PromiseWritable(writable)
      return promiseWritable.writeAll('new content here')
    })

    Then('new file contains the new content', () => {
      const content = mockFs.readFileSync(realFilename, { encoding: 'utf8' })
      content.should.equal('new content here')
    })
  })

  Scenario('FsBlobStorage produces read stream', () => {
    const testKey = 'read'

    let readable
    let storage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, fs: mockFs })
    })

    When('key test is passed in', () => {
      return storage.createReadStream(testKey, { ext: '.txt', encoding: 'utf8' })
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
  })

  Scenario('FsBlobStorage commits file', () => {
    const testKey = 'commit'
    const realFilename = path.join(STORAGEDIR, testKey + '.txt')

    let storage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, defaultPart: '.lock', fs: mockFs })
    })

    When('key rs is passed in', () => {
      return storage.commit(testKey, { ext: '.txt' })
    })

    Then('rs.part should be renamed to rs', () => {
      return mockFs.existsSync(realFilename).should.be.true
    })
  })

  Scenario('FsBlobStorage removes file', () => {
    const testKey = 'remove'
    const realFilename = path.join(STORAGEDIR, testKey + '.txt')

    let storage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, fs: mockFs })
    })

    When('key remove is passed in', () => {
      return storage.remove(testKey, { ext: '.txt' })
    })

    Then('remove should be removed', () => {
      return mockFs.existsSync(realFilename).should.be.false
    })
  })
})
