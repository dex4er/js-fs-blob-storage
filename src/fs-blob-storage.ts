/// <reference types="node" />

import * as fs from "node:fs"
import * as path from "node:path"

export interface FsBlobStorageOptions {
  ext?: string
  part?: string
  exclusive?: boolean
  path?: string
  fs?: typeof fs
}

export interface FsBlobStorageWriteStreamOptions {
  ext?: string
  part?: string
  encoding?: BufferEncoding
}

export interface FsBlobStorageReadStreamOptions {
  ext?: string
  encoding?: BufferEncoding
}

export interface FsBlobStorageCommitOptions {
  ext?: string
  part?: string
}

export interface FsBlobStorageRemoveOptions {
  ext?: string
}

export const DEFAULT_EXT = ""
export const DEFAULT_PART = ".part"

export class FsBlobStorage {
  protected ext: string
  protected part: string
  protected writeFlags: string
  protected fs: typeof fs
  protected path: string

  constructor(options: FsBlobStorageOptions = {}) {
    this.ext = options.ext !== undefined ? options.ext : DEFAULT_EXT
    this.part = options.part !== undefined ? options.part : DEFAULT_PART
    this.writeFlags = options.exclusive ? "wx" : "w"
    this.fs = options.fs || fs
    this.path = options.path || "."
  }

  async createWriteStream(key: string, options: FsBlobStorageWriteStreamOptions = {}): Promise<fs.WriteStream> {
    const {ext = this.ext, part = this.part, encoding} = options
    const filepath = path.join(this.path, key + ext)
    const dirpath = path.dirname(filepath)

    await this.fs.promises.mkdir(dirpath, {recursive: true})

    // for exclusive mode it will reject if file already exist
    const fd = await this.fs.promises.open(filepath, this.writeFlags)

    if (part) {
      // do `open` instead of `stat` to prevent race condition
      const fdPart = await this.fs.promises.open(filepath + part, this.writeFlags)

      // `close` before `rename` just for Windows
      await fdPart.close()

      // `rename` overwrites quietly the file
      await this.fs.promises.rename(filepath, filepath + part)
    }

    // first argument is ignored
    return this.fs.createWriteStream(filepath + part, {fd, encoding})
  }

  async createReadStream(key: string, options: FsBlobStorageReadStreamOptions = {}): Promise<fs.ReadStream> {
    const {ext = this.ext, encoding} = options
    const filepath = path.join(this.path, key + ext)

    const fd = await this.fs.promises.open(filepath, "r")

    const stats = await this.fs.promises.stat(filepath)

    if (!stats.size) {
      throw Object.assign(new Error(`ENOENT: empty file, open '${filepath}'`), {
        code: "ENOENT",
        path: filepath,
      })
    }

    return this.fs.createReadStream(filepath, {fd, encoding})
  }

  async commit(key: string, options: FsBlobStorageCommitOptions = {}): Promise<void> {
    const {ext = this.ext, part = this.part} = options
    if (part) {
      const filepath = path.join(this.path, key + ext)
      return this.fs.promises.rename(filepath + part, filepath)
    }
  }

  async remove(key: string, options: FsBlobStorageRemoveOptions = {}): Promise<void> {
    const {ext = this.ext} = options
    const filepath = path.join(this.path, key + ext)
    return this.fs.promises.unlink(filepath)
  }
}

export default FsBlobStorage
