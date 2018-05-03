#!/usr/bin/env ts-node

import { FsBlobStorage } from '../lib/fs-blob-storage'

import { PromisePiping, PromiseReadablePiping } from 'promise-piping'

const SPOOLDIR = process.env.SPOOLDIR || '.'

async function main (): Promise<void> {
  const storage = new FsBlobStorage({ path: SPOOLDIR, gzip: true })

  const key = process.argv[2]

  if (!key) {
    console.error(`Usage: ${process.argv[1]} key`)
    process.exit(1)
  }

  const stream = await storage.createReadStream(key) as PromiseReadablePiping
  console.debug('createReadStream returned')

  // extra debug trace
  // tslint:disable:no-unnecessary-type-assertion
  for (const s of [stream.promiseReadable.stream, stream.stream, process.stdout] as any[]) {
    for (const event of ['close', 'data', 'drain', 'end', 'error', 'finish', 'pipe', 'readable', 'unpipe']) {
      if (s === process.stdout && ['data', 'readable'].includes(event)) continue
      const name = s === process.stdout ? 'stdout' : s.constructor.name
      s.on(event, (arg?: any) => console.debug(`${name} emitted ${event}:`, typeof arg === 'object' ? arg.constructor.name : arg))
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
