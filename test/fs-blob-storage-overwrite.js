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
const PromiseWritable = require('promise-writable')
const { Writable } = require('stream')

const STORAGEDIR = '/tmp/storage'

Feature('Test FsBlobStorage overwrite', () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      'exists1.part': 'already exists',
      'exists2': 'already exists',
      'exists3.part': 'already exists',
      'exists3': 'already exists'
    }
  }

  Scenario('FsBlobStorage produces write stream when part file exists', () => {
    const testKey = 'exists1'
    const realFilename = path.join(STORAGEDIR, testKey + '.part')

    let storage
    let writable

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, fs: mockFs })
    })

    When('key test is passed in', () => {
      return storage.createWriteStream(testKey)
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

  Scenario('FsBlobStorage produces write stream when object file exists', () => {
    const testKey = 'exists2'
    const realFilename = path.join(STORAGEDIR, testKey + '.part')

    let storage
    let writable

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, fs: mockFs })
    })

    When('key test is passed in', () => {
      return storage.createWriteStream(testKey)
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

  Scenario('FsBlobStorage commits file when object file exists', () => {
    const testKey = 'exists3'
    const realFilename = path.join(STORAGEDIR, testKey + '')

    let storage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, fs: mockFs })
    })

    When('key rs is passed in', () => {
      return storage.commit(testKey)
    })

    Then('rs.part should be renamed to rs', () => {
      return mockFs.existsSync(realFilename).should.be.true
    })
  })
})
