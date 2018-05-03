/// <reference types="node" />

import makeDir from 'make-dir'
import fs from 'mz/fs'
import path from 'path'
import { PromiseReadablePiping, PromiseWritablePiping } from 'promise-piping'
import PromiseReadable from 'promise-readable'
import PromiseWritable from 'promise-writable'
import { Duplex, Readable, Writable } from 'stream'
import zlib from 'zlib'

export interface FsBlobStorageOptions {
  exclusive?: boolean
  extGz?: string
  gzip?: zlib.ZlibOptions | boolean
  path: string
}

export interface FsBlobStorageWriteStreamOptions {
  ext?: string
  part?: string
  encoding?: string
}

export interface FsBlobStorageReadStreamOptions {
  ext?: string
  encoding?: string
}

export interface FsBlobStorageCommitOptions {
  ext?: string
  part?: string
}

export interface FsBlobStorageRemoveOptions {
  ext?: string
}

export class FsBlobStorage {
  private readonly extGz: string
  private readonly gzipOptions?: zlib.ZlibOptions
  private readonly path: string
  private readonly writeFlags: string

  constructor (options: FsBlobStorageOptions)

  createWriteStream (key: string, options?: FsBlobStorageWriteStreamOptions): Promise<PromiseWritable<Writable> | PromiseWritablePiping>
  createReadStream (key: string, options?: FsBlobStorageReadStreamOptions): Promise<PromiseReadable<Readable | Duplex> | PromiseReadablePiping>
  commit (key: string, options?: FsBlobStorageCommitOptions): Promise<void>
  remove (key: string, options?: FsBlobStorageRemoveOptions): Promise<void>
}

export default FsBlobStorage
