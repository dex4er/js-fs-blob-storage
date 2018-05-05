const makeDir = require('make-dir')
const fs = require('fs')
const fsPromises = require('mz/fs')
const path = require('path')

const DEFAULT_EXT = ''
const DEFAULT_PART = '.part'

/**
 * @interface FsBlobStorageOptions
 * @property {boolean} [exclusive]
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
  constructor (options = {}) {
    this.writeFlags = options.exclusive ? 'wx' : 'w'
    this.path = options.path || '.'
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageWriteStreamOptions} [options]
   * @returns {Promise<Writable>}
   */
  async createWriteStream (key, options = {}) {
    const { ext = DEFAULT_EXT, part = DEFAULT_PART, encoding = 'utf8' } = options
    const filepath = path.join(this.path, key + ext)
    const dirpath = path.dirname(filepath)
    await makeDir(dirpath)

    const fd = await fsPromises.open(filepath, this.writeFlags)

    if (part) {
      const fdPart = await fsPromises.open(filepath + part, this.writeFlags)
      await fsPromises.rename(filepath, filepath + part)
      await fsPromises.close(fdPart)
    }

    const file = fs.createWriteStream(filepath, { fd, encoding })

    return file
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageReadStreamOptions} [options]
   * @returns {Promise<Readable>}
   */
  async createReadStream (key, options = {}) {
    const { ext = DEFAULT_EXT, encoding = 'utf8' } = options
    const filepath = path.join(this.path, key + ext)

    const fd = await fsPromises.open(filepath, 'r')
    const stats = await fsPromises.stat(filepath)

    if (!stats.size) {
      throw Object.assign(new Error(`ENOENT: empty file, open '${filepath}'`), { code: 'ENOENT', path: filepath })
    }

    const file = fs.createReadStream(filepath, { fd, encoding })

    return file
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageCommitOptions} [options]
   * @returns {Promise<void>}
   */
  async commit (key, options = {}) {
    const { ext = DEFAULT_EXT, part = DEFAULT_PART } = options
    if (part) {
      const filepath = path.join(this.path, key + ext)
      await fsPromises.rename(filepath + part, filepath)
    }
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageRemoveOptions} [options]
   * @returns {Promise<void>}
   */
  async remove (key, options = {}) {
    const { ext = DEFAULT_EXT } = options
    const filepath = path.join(this.path, key + ext)
    await fsPromises.unlink(filepath)
  }
}

FsBlobStorage.FsBlobStorage = FsBlobStorage
FsBlobStorage.default = FsBlobStorage

module.exports = FsBlobStorage
