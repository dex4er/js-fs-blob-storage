import chai, {expect} from "chai"

import dirtyChai from "dirty-chai"
chai.use(dirtyChai)

import {After, And, Before, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {ReadStream, WriteStream} from "fs"
import path from "path"
import {PromiseReadable} from "promise-readable"
import {PromiseWritable} from "promise-writable"
import {Readable, Writable} from "stream"

import FsBlobStorage from "../src/fs-blob-storage"

import mockFs from "./lib/mock-fs"

const STORAGEDIR = "/tmp/storage"

Feature("Test FsBlobStorage with ext option", () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      "commit.txt.part": "another file content here",
      "read.txt": "file content here",
      "remove.txt": "more file content here",
    },
  }

  Scenario("FsBlobStorage produces write stream", () => {
    const testKey = "write"
    const realFilename = path.join(STORAGEDIR, testKey + ".txt.part")

    let promiseWritable: PromiseWritable<WriteStream>
    let storage: FsBlobStorage
    let writable: WriteStream

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      writable = await storage.createWriteStream(testKey, {ext: ".txt"})
    })

    Then("created Writable should not be null", () => {
      expect(writable).to.be.an.instanceof(Writable)
    })

    And(".part file should be created", () => {
      expect(mockFs.existsSync(realFilename)).to.be.true()
    })

    When("I write to the Writable stream", async () => {
      promiseWritable = new PromiseWritable(writable)
      await promiseWritable.writeAll("new content here")
    })

    Then("new file contains the new content", () => {
      const content = mockFs.readFileSync(realFilename, {encoding: "utf8"})
      expect(content).is.equal("new content here")
    })

    After(() => {
      if (promiseWritable) {
        promiseWritable.destroy()
      }
    })
  })

  Scenario("FsBlobStorage produces read stream", () => {
    const testKey = "read"

    let promiseReadable: PromiseReadable<ReadStream>
    let readable: ReadStream
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      readable = await storage.createReadStream(testKey, {
        ext: ".txt",
        encoding: "utf8",
      })
    })

    Then("created Readable should not be null", () => {
      expect(readable).to.be.an.instanceof(Readable)
    })

    And("Readable should contain the content", async () => {
      promiseReadable = new PromiseReadable(readable)
      expect(await promiseReadable.read()).to.equal("file content here")
    })

    After(() => {
      if (promiseReadable) {
        promiseReadable.destroy()
      }
    })
  })

  Scenario("FsBlobStorage commits file", () => {
    const testKey = "commit"
    const realFilename = path.join(STORAGEDIR, testKey + ".txt")

    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key rs is passed in", async () => {
      await storage.commit(testKey, {ext: ".txt"})
    })

    Then("rs.part should be renamed to rs", () => {
      expect(mockFs.existsSync(realFilename)).to.be.true()
    })
  })

  Scenario("FsBlobStorage removes file", () => {
    const testKey = "remove"
    const realFilename = path.join(STORAGEDIR, testKey + ".txt")

    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key remove is passed in", async () => {
      await storage.remove(testKey, {ext: ".txt"})
    })

    Then("remove should be removed", () => {
      expect(mockFs.existsSync(realFilename)).to.be.false()
    })
  })
})
