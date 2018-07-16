'use strict'

const t = require('tap')
require('tap-given')(t)

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const mockFs = require('../mock/mock-fs')

const { FsBlobStorage } = require('../lib/fs-blob-storage')

const STORAGEDIR = '/tmp/storage'

Feature('Test FsBlobStorage errors for exclusive option', () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      'exists1.part': 'already exists',
      'exists2': 'already exists'
    }
  }

  Scenario('FsBlobStorage tries to produce write stream when part file exists', () => {
    const testKey = 'exists1'

    let error
    let storage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, exclusive: true, fs: mockFs })
    })

    When('key test is passed in', () => {
      return storage.createWriteStream(testKey)
        .catch((err) => {
          error = err
        })
    })

    Then('error is caught', () => {
      error.should.be.an.instanceof(Error)
        .and.have.property('code').that.is.equal('EEXIST')
    })
  })

  Scenario('FsBlobStorage tries to produce write stream when object file exists', () => {
    const testKey = 'exists2'

    let error
    let storage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({ path: STORAGEDIR, exclusive: true, fs: mockFs })
    })

    When('key test is passed in', () => {
      return storage.createWriteStream(testKey)
        .catch((err) => {
          error = err
        })
    })

    Then('error is caught', () => {
      error.should.be.an.instanceof(Error)
        .and.have.property('code').that.is.equal('EEXIST')
    })
  })
})
