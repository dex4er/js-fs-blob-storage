/// <reference types="node" />

import fs from 'fs'

export interface FsBlobStorageOptions {
  exclusive?: boolean
  path?: string
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
  private readonly path: string
  private readonly writeFlags: string

  constructor (options?: FsBlobStorageOptions)

  createWriteStream (key: string, options?: FsBlobStorageWriteStreamOptions): Promise<fs.WriteStream>
  createReadStream (key: string, options?: FsBlobStorageReadStreamOptions): Promise<fs.ReadStream>
  commit (key: string, options?: FsBlobStorageCommitOptions): Promise<void>
  remove (key: string, options?: FsBlobStorageRemoveOptions): Promise<void>
}

export default FsBlobStorage
