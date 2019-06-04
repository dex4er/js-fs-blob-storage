import {And, Before, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {ReadStream, WriteStream} from "fs"
import path from "path"
import {PromiseReadable} from "promise-readable"
import {PromiseWritable} from "promise-writable"
import {Readable, Writable} from "stream"

import FsBlobStorage from "../src/fs-blob-storage"

import mockFs from "./lib/mock-fs"

const STORAGEDIR = "/tmp/storage"

Feature("Test FsBlobStorage with empty part options", () => {
  // tslint:disable:object-literal-key-quotes
  const fakeFilesystem = {
    [STORAGEDIR]: {
      commit: "another file content here",
      read: "file content here",
      remove: "more file content here",
    },
  }

  Scenario("FsBlobStorage produces write stream", () => {
    const testKey = "write"
    const realFilename = path.join(STORAGEDIR, testKey)
    const realFilenamePart = realFilename + ".part"

    let storage: FsBlobStorage
    let writable: WriteStream

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      writable = await storage.createWriteStream(testKey, {part: ""})
    })

    Then("created Writable should not be null", () => {
      writable.should.be.an.instanceof(Writable)
    })

    And(".part file should no be created", () => {
      return mockFs.existsSync(realFilenamePart).should.be.false
    })

    When("I write to the Writable stream", async () => {
      const promiseWritable = new PromiseWritable(writable)
      await promiseWritable.writeAll("new content here")
    })

    Then("new file contains the new content", () => {
      const content = mockFs.readFileSync(realFilename, {encoding: "utf8"})
      content.should.equal("new content here")
    })
  })

  Scenario("FsBlobStorage produces read stream", () => {
    const testKey = "read"

    let readable: ReadStream
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      readable = await storage.createReadStream(testKey)
    })

    Then("created Readable should not be null", () => {
      readable.should.be.an.instanceof(Readable)
    })

    And("Readable should contain the content", async () => {
      const promiseReadable = new PromiseReadable(readable)
      await promiseReadable.read().should.eventually.deep.equal(Buffer.from("file content here"))
    })
  })

  Scenario("FsBlobStorage commits file", () => {
    const testKey = "commit"
    const realFilename = path.join(STORAGEDIR, testKey + "")

    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key rs is passed in", async () => {
      await storage.commit(testKey, {part: ""})
    })

    Then("rs should exists", () => {
      return mockFs.existsSync(realFilename).should.be.true
    })
  })

  Scenario("FsBlobStorage removes file", () => {
    const testKey = "remove"
    const realFilename = path.join(STORAGEDIR, testKey + "")

    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key remove is passed in", async () => {
      await storage.remove(testKey)
    })

    Then("remove should be removed", () => {
      return mockFs.existsSync(realFilename).should.be.false
    })
  })
})
