/// <reference types="node" />

import fs from 'fs'

export interface FsBlobStorageOptions {
  defaultExt?: string
  defaultPart?: string
  exclusive?: boolean
  path?: string
  fs?: typeof fs
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
  constructor (options?: FsBlobStorageOptions)

  createWriteStream (key: string, options?: FsBlobStorageWriteStreamOptions): Promise<fs.WriteStream>
  createReadStream (key: string, options?: FsBlobStorageReadStreamOptions): Promise<fs.ReadStream>
  commit (key: string, options?: FsBlobStorageCommitOptions): Promise<void>
  remove (key: string, options?: FsBlobStorageRemoveOptions): Promise<void>
}

export default FsBlobStorage
