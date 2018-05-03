const makeDir = require('make-dir')
const fs = require('mz/fs')
const path = require('path')
const { PromiseReadablePiping, PromiseWritablePiping } = require('promise-piping')
const { PromiseReadable } = require('promise-readable')
const { PromiseWritable } = require('promise-writable')
const zlib = require('zlib')

const DEFAULT_EXT = ''
const DEFAUTL_EXT_GZ = '.gz'
const DEFAULT_PART = '.part'

/**
 * @interface FsBlobStorageOptions
 * @property {boolean} [exclusive]
 * @property {string} [extGz]
 * @property {zlib.ZlibOptions | boolean} [gzip]
 * @property {string} path
 */

/**
 * @interface FsBlobStorageWriteStreamOptions
 * @property {string} [ext]
 * @property {string} [part]
 * @property {string} [encoding]
 */

/**
 * @interface FsBlobStorageReadStreamOptions
 * @property {string} [ext]
 * @property {string} [encoding]
 */

/**
 * @interface FsBlobStorageCommitOptions
 * @property {string} [ext]
 * @property {string} [part]
 */

/**
 * @interface FsBlobStorageRemoveOptions
 * @property {string} [ext]
 */

/**
 * @class
 * @param {FsBlobStorageOptions} [options]
 */
class FsBlobStorage {
  constructor (options) {
    if (options.gzip) {
      this.gzipOptions = typeof options.gzip === 'object' ? options.gzip : {}
      this.extGz = options.extGz !== undefined ? options.extGz : DEFAUTL_EXT_GZ
    } else {
      this.extGz = ''
    }
    this.writeFlags = options.exclusive ? 'wx' : 'w'
    this.path = options.path
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageWriteStreamOptions} [options]
   * @returns {Promise<PromiseWritable<Writable> | PromiseWritablePiping>}
   */
  async createWriteStream (key, options = {}) {
    const { ext = DEFAULT_EXT, part = DEFAULT_PART, encoding = 'utf8' } = options
    const gz = this.extGz
    const filepath = path.join(this.path, key + ext + gz)
    const dirpath = path.dirname(filepath)
    await makeDir(dirpath)

    const fd = await fs.open(filepath, this.writeFlags)

    if (part) {
      const fdPart = await fs.open(filepath + part, this.writeFlags)
      await fs.rename(filepath, filepath + path)
      await fs.close(fdPart)
    }

    const file = fs.createWriteStream(filepath, { fd, encoding })

    if (this.gzipOptions) {
      const gzip = zlib.createGzip(this.gzipOptions)
      return new PromiseWritablePiping(gzip, file)
    }

    return new PromiseWritable(file)
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageReadStreamOptions} [options]
   * @returns {Promise<PromiseReadable<Readable | Duplex> | PromiseReadablePiping>}
   */
  async createReadStream (key, options = {}) {
    const { ext = DEFAULT_EXT, encoding = 'utf8' } = options
    const gz = this.extGz
    const filepath = path.join(this.path, key + ext + gz)

    const fd = await fs.open(filepath, 'r')
    const stats = await fs.stat(filepath)

    if (!stats.size) {
      throw Object.assign(new Error(`ENOENT: empty file, open '${filepath}'`), { code: 'ENOENT', path: filepath })
    }

    const file = fs.createReadStream(filepath, { fd, encoding })

    if (this.gzipOptions) {
      const gunzip = zlib.createGunzip(this.gzipOptions)
      return new PromiseReadablePiping(file, gunzip)
    }

    return new PromiseReadable(file)
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageCommitOptions} [options]
   * @returns {Promise<void>}
   */
  async commit (key, options = {}) {
    const { ext = DEFAULT_EXT, part = DEFAULT_PART } = options
    if (part) {
      const gz = this.extGz
      const filepath = path.join(this.path, key + ext + gz)
      await fs.rename(filepath + part, filepath)
    }
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageRemoveOptions} [options]
   * @returns {Promise<void>}
   */
  async remove (key, options = {}) {
    const { ext = DEFAULT_EXT } = options
    const gz = this.extGz
    const filepath = path.join(this.path, key + ext + gz)
    await fs.unlink(filepath)
  }
}

FsBlobStorage.FsBlobStorage = FsBlobStorage
FsBlobStorage.default = FsBlobStorage

module.exports = FsBlobStorage
