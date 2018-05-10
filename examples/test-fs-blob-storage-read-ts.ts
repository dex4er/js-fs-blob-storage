#!/usr/bin/env ts-node

import FsBlobStorage from '../lib/fs-blob-storage'

import pump from 'pump'
import util from 'util'

const pumpPromise: (...streams: pump.Stream[]) => Promise<void> = util.promisify(pump)

const SPOOLDIR = process.env.SPOOLDIR || '.'
const DEBUG = process.env.DEBUG === 'true'

async function main (): Promise<void> {
  const storage = new FsBlobStorage({ path: SPOOLDIR })

  const key = process.argv[2]

  if (!key) {
    console.error(`Usage: ${process.argv[1]} key`)
    process.exit(1)
  }

  const stream = await storage.createReadStream(key)
  if (DEBUG) console.debug('createReadStream returned')

  // extra debug trace
  // tslint:disable:no-unnecessary-type-assertion
  if (DEBUG) {
    for (const s of [stream, process.stdout] as any[]) {
      for (const event of ['close', 'data', 'drain', 'end', 'error', 'finish', 'pipe', 'readable', 'unpipe']) {
        if (s === process.stdout && ['data', 'readable'].includes(event)) continue
        const name = s === process.stdout ? 'stdout' : s.constructor.name
        s.on(event, (arg?: any) => console.debug(`${name} emitted ${event}:`, typeof arg === 'object' ? arg.constructor.name : arg))
      }
    }
  }

  if (DEBUG) console.info(`Reading from ${SPOOLDIR}/${key} ...`)

  await pumpPromise(stream, process.stdout)

  if (DEBUG) console.debug('stream ended')
  if (DEBUG) console.info('Done.')
}

main().catch((err) => console.error(err))