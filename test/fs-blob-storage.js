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

const STORAGEDIR = '/tmp/storage'

Feature('Test FsBlobStorage without options', () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      'commit.part': 'another file content here',
      'read': 'file content here',
      'remove': 'more file content here'
    }
  }

  Scenario('Make new empty FsBlobStorage', () => {
    let storage

    When('new FsBlobStorage object is created', () => {
      storage = new FsBlobStorage()
    })

    Then('FsBlobStorage object has correct type', () => {
      storage.should.be.an.instanceof(FsBlobStorage)
    })
  })

  Scenario('FsBlobStorage produces write stream', () => {
    const testKey = 'write'
    const realFilename = path.join(STORAGEDIR, testKey + '.part')

    let storage
    let writable

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key test is passed in', () => {
      return storage.createWriteStream(testKey)
        .then((value) => {
          writable = value
        })
    })

    Then('created Writable should not be null', () => {
      writable.should.be.an.instanceof(fs.WriteStream)
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
      content.should.equal('new content here')
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
      return storage.createReadStream(testKey)
        .then((value) => {
          readable = value
        })
    })

    Then('created Readable should not be null', () => {
      readable.should.be.an.instanceof(fs.ReadStream)
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
    const realFilename = path.join(STORAGEDIR, testKey + '')

    let storage

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key rs is passed in', () => {
      return storage.commit(testKey)
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
    const realFilename = path.join(STORAGEDIR, testKey + '')

    let storage

    Before(() => {
      mockFs(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR })
    })

    When('key remove is passed in', () => {
      return storage.remove(testKey)
    })

    Then('remove should be removed', () => {
      return fs.existsSync(realFilename).should.be.false
    })

    After(() => {
      mockFs.restore()
    })
  })
})
