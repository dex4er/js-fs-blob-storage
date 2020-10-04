import {expect} from "chai"

import {Before, Feature, Given, Scenario, Then, When} from "./lib/steps"

import {FsBlobStorage} from "../src/fs-blob-storage"

import {mockFs} from "./lib/mock-fs"

const STORAGEDIR = "/tmp/storage"

Feature("Test FsBlobStorage errors", () => {
  // tslint:disable:object-literal-key-quotes
  const fakeFilesystem = {
    [STORAGEDIR]: {
      empty: "",
    },
  }

  Scenario("FsBlobStorage tries to produce read stream when object does not exist", () => {
    const testKey = "notexist"

    let error: Error
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      try {
        await storage.createReadStream(testKey)
      } catch (e) {
        error = e
      }
    })

    Then("error is caught", () => {
      expect(error).to.be.an("error").and.have.property("code", "ENOENT")
    })
  })

  Scenario("FsBlobStorage tries to produce read stream when object is empty", () => {
    const testKey = "empty"

    let error: Error
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      try {
        await storage.createReadStream(testKey)
      } catch (e) {
        error = e
      }
    })

    Then("error is caught", () => {
      expect(error).to.be.an("error").and.have.property("code", "ENOENT")
    })
  })

  Scenario("FsBlobStorage tries to commit file when part file does not exist", () => {
    const testKey = "notexist"

    let error: Error
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key test is passed in", async () => {
      try {
        await storage.commit(testKey)
      } catch (e) {
        error = e
      }
    })

    Then("error is caught", () => {
      expect(error).to.be.an("error").and.have.property("code", "ENOENT")
    })
  })

  Scenario("FsBlobStorage tries to remove file when object does not exist", () => {
    const testKey = "notexist"

    let error: Error
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({path: STORAGEDIR, fs: mockFs as any})
    })

    When("key remove is passed in", async () => {
      try {
        await storage.remove(testKey)
      } catch (e) {
        error = e
      }
    })

    Then("error is caught", () => {
      expect(error).to.be.an("error").and.have.property("code", "ENOENT")
    })
  })
})
