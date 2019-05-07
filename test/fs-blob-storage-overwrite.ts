import {And, Before, Feature, Given, Scenario, Then, When} from './lib/steps'

import {WriteStream} from 'fs'
import path from 'path'
import PromiseWritable from 'promise-writable'
import {Writable} from 'stream'

import FsBlobStorage from '../src/fs-blob-storage'

import mockFs from './lib/mock-fs'

const STORAGEDIR = '/tmp/storage'

Feature('Test FsBlobStorage overwrite', () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      'exists1.part': 'already exists',
      exists2: 'already exists',
      'exists3.part': 'already exists',
      exists3: 'already exists',
    },
  }

  Scenario('FsBlobStorage produces write stream when part file exists', () => {
    const testKey = 'exists1'
    const realFilename = path.join(STORAGEDIR, testKey + '.part')

    let storage: FsBlobStorage
    let writable: WriteStream

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When('key test is passed in', async () => {
      writable = await storage.createWriteStream(testKey)
    })

    Then('created Writable should not be null', () => {
      writable.should.be.an.instanceof(Writable)
    })

    And('.part file should be created', () => {
      return mockFs.existsSync(realFilename).should.be.true
    })

    When('I write to the Writable stream', async () => {
      const promiseWritable = new PromiseWritable(writable)
      await promiseWritable.writeAll('new content here')
    })

    Then('new file contains the new content', () => {
      const content = mockFs.readFileSync(realFilename, {encoding: 'utf8'})
      content.should.equal('new content here')
    })
  })

  Scenario('FsBlobStorage produces write stream when object file exists', () => {
    const testKey = 'exists2'
    const realFilename = path.join(STORAGEDIR, testKey + '.part')

    let storage: FsBlobStorage
    let writable: WriteStream

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When('key test is passed in', async () => {
      writable = await storage.createWriteStream(testKey)
    })

    Then('created Writable should not be null', () => {
      writable.should.be.an.instanceof(Writable)
    })

    And('.part file should be created', () => {
      return mockFs.existsSync(realFilename).should.be.true
    })

    When('I write to the Writable stream', async () => {
      const promiseWritable = new PromiseWritable(writable)
      await promiseWritable.writeAll('new content here')
    })

    Then('new file contains the new content', () => {
      const content = mockFs.readFileSync(realFilename, {encoding: 'utf8'})
      content.should.equal('new content here')
    })
  })

  Scenario('FsBlobStorage commits file when object file exists', () => {
    const testKey = 'exists3'
    const realFilename = path.join(STORAGEDIR, testKey + '')

    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given('FsBlobStorage object', () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When('key rs is passed in', async () => {
      await storage.commit(testKey)
    })

    Then('rs.part should be renamed to rs', () => {
      return mockFs.existsSync(realFilename).should.be.true
    })
  })
})
