#!/usr/bin/env ts-node

import { FsBlobStorage } from '../lib/fs-blob-storage'

import { PromisePiping, PromiseWritablePiping } from 'promise-piping'

const SPOOLDIR = process.env.SPOOLDIR || '.'

async function main (): Promise<void> {
  const storage = new FsBlobStorage({ path: SPOOLDIR, gzip: true, exclusive: true })

  const key = process.argv[2]

  if (!key) {
    console.error(`Usage: ${process.argv[1]} key`)
    process.exit(1)
  }

  const stream = await storage.createWriteStream(key) as PromiseWritablePiping
  console.debug('createWriteStream returned')

  // extra debug trace
  // tslint:disable:no-unnecessary-type-assertion
  for (const s of [process.stdin, stream.stream, stream.promiseWritable.stream] as any[]) {
    for (const event of ['close', 'data', 'drain', 'end', 'error', 'finish', 'pipe', 'readable', 'unpipe']) {
      const name = s === process.stdin ? 'stdin' : s.constructor.name
      s.on(event, (arg?: any) => console.debug(`${name} emitted ${event}:`, typeof arg === 'object' ? arg.constructor.name : arg))
    }
  }

  console.info(`Writing to ${SPOOLDIR}/${key} ...`)

  const piping = new PromisePiping(process.stdin, stream)

  await piping.once('close')
  piping.destroy()
  console.debug('stream finished')

  await storage.commit(key)
  console.info('Done.')
}

main().catch((err) => console.error(err))
