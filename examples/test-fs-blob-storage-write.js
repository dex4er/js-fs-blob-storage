#!/usr/bin/env node

require("stream.pipeline-shim/auto")

const stream = require("stream")
const util = require("util")

const {FsBlobStorage} = require("../lib/fs-blob-storage")

const pipelinePromise = util.promisify(stream.pipeline)

const SPOOLDIR = process.env.SPOOLDIR || "."
const DEBUG = Boolean(process.env.DEBUG)

async function main() {
  const storage = new FsBlobStorage({path: SPOOLDIR, exclusive: true})

  const key = process.argv[2]

  if (!key) {
    console.error(`Usage: ${process.argv[1]} key`)
    process.exit(1)
  }

  const writable = await storage.createWriteStream(key)
  if (DEBUG) console.debug("createWriteStream returned")

  // extra debug trace
  if (DEBUG) {
    for (const s of [process.stdin, writable]) {
      for (const event of ["close", "data", "drain", "end", "error", "finish", "pipe", "readable", "unpipe"]) {
        const name = s === process.stdin ? "stdin" : s.constructor.name
        s.on(event, arg =>
          console.debug(`${name} emitted ${event}:`, typeof arg === "object" ? arg.constructor.name : arg),
        )
      }
    }
  }

  if (DEBUG) console.info(`Writing to ${SPOOLDIR}/${key} ...`)

  await pipelinePromise(process.stdin, writable)

  if (DEBUG) console.debug("stream finished")

  await storage.commit(key)
  if (DEBUG) console.info("Done.")
}

main().catch(err => console.error(err))
