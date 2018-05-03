#!/usr/bin/env node

const FsBlobStorage = require('../lib/fs-blob-storage')

const PromisePiping = require('promise-piping')

const SPOOLDIR = process.env.SPOOLDIR || '.'

async function main () {
  const storage = new FsBlobStorage({ path: SPOOLDIR, gzip: true })

  const key = process.argv[2]

  if (!key) {
    console.error(`Usage: ${process.argv[1]} key`)
    process.exit(1)
  }

  const stream = await storage.createReadStream(key)
  console.debug('createReadStream returned')

  // extra debug trace
  for (const s of [stream.promiseReadable.stream, stream.stream, process.stdout]) {
    for (const event of ['close', 'data', 'drain', 'end', 'error', 'finish', 'pipe', 'readable', 'unpipe']) {
      if (s === process.stdout && ['data', 'readable'].includes(event)) continue
      const name = s === process.stdout ? 'stdout' : s.constructor.name
      s.on(event, (arg) => console.debug(`${name} emitted ${event}:`, typeof arg === 'object' ? arg.constructor.name : arg))
    }
  }

  console.info(`Reading from ${SPOOLDIR}/${key} ...`)

  const piping = new PromisePiping(stream, process.stdout)

  await piping.once('unpipe') // stdout doesn't support 'end' event
  piping.destroy()
  console.debug('stream ended')
  console.info('Done.')
}

main().catch((err) => console.error(err))
