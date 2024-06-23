import {expect} from "chai"

import {FsBlobStorage} from "../src/fs-blob-storage.js"

import {mockFs} from "./lib/mock-fs.js"

import {Before, Feature, Given, Scenario, Then, When} from "./lib/steps.js"

const STORAGEDIR = "/tmp/storage"

Feature("Test FsBlobStorage errors for exclusive option", () => {
  const fakeFilesystem = {
    [STORAGEDIR]: {
      "exists1.part": "already exists",
      exists2: "already exists",
    },
  }

  Scenario("FsBlobStorage tries to produce write stream when part file exists", () => {
    const testKey = "exists1"

    let error: any
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({
        path: STORAGEDIR,
        exclusive: true,
        fs: mockFs as any,
      })
    })

    When("key test is passed in", async () => {
      try {
        await storage.createWriteStream(testKey)
      } catch (e) {
        error = e
      }
    })

    Then("error is caught", () => {
      expect(error).to.be.an("error").and.have.property("code", "EEXIST")
    })
  })

  Scenario("FsBlobStorage tries to produce write stream when object file exists", () => {
    const testKey = "exists2"

    let error: any
    let storage: FsBlobStorage

    Before(() => {
      mockFs.init(fakeFilesystem)
    })

    Given("FsBlobStorage object", () => {
      storage = new FsBlobStorage({
        path: STORAGEDIR,
        exclusive: true,
        fs: mockFs as any,
      })
    })

    When("key test is passed in", async () => {
      try {
        await storage.createWriteStream(testKey)
      } catch (e) {
        error = e
      }
    })

    Then("error is caught", () => {
      expect(error).to.be.an("error").and.have.property("code", "EEXIST")
    })
  })
})
