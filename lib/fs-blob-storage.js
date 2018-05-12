const fs = require('fs')
const makeDir = require('make-dir')
const path = require('path')
const promisify = require('util.promisify')

const fsPromises = {}

for (const method of ['close', 'open', 'rename', 'stat', 'unlink']) {
  fsPromises[method] = promisify(fs[method])
}

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
  createWriteStream (key, options = {}) {
    const { ext = DEFAULT_EXT, part = DEFAULT_PART, encoding = 'utf8' } = options
    const filepath = path.join(this.path, key + ext)
    const dirpath = path.dirname(filepath)

    if (part) {
      let fd, fdPart

      return makeDir(dirpath).then(() => {
        return fsPromises.open(filepath, this.writeFlags)
      }).then((value) => {
        fd = value
        return fsPromises.open(filepath + part, this.writeFlags)
      }).then((value) => {
        fdPart = value
        return fsPromises.rename(filepath, filepath + part)
      }).then(() => {
        return fsPromises.close(fdPart)
      }).then(() => {
        return fs.createWriteStream(filepath + part, { fd, encoding })
      })
    }

    return makeDir(dirpath).then(() => {
      return fsPromises.open(filepath, this.writeFlags)
    }).then((fd) => {
      return fs.createWriteStream(filepath, { fd, encoding })
    })
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageReadStreamOptions} [options]
   * @returns {Promise<Readable>}
   */
  createReadStream (key, options = {}) {
    const { ext = DEFAULT_EXT, encoding = 'utf8' } = options
    const filepath = path.join(this.path, key + ext)

    let fd

    return fsPromises.open(filepath, 'r').then((value) => {
      fd = value
      return fsPromises.stat(filepath)
    }).then((stats) => {
      if (!stats.size) {
        return Promise.reject(Object.assign(new Error(`ENOENT: empty file, open '${filepath}'`), { code: 'ENOENT', path: filepath }))
      }

      return fs.createReadStream(filepath, { fd, encoding })
    })
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageCommitOptions} [options]
   * @returns {Promise<void>}
   */
  commit (key, options = {}) {
    const { ext = DEFAULT_EXT, part = DEFAULT_PART } = options
    if (part) {
      const filepath = path.join(this.path, key + ext)
      return fsPromises.rename(filepath + part, filepath)
    }
  }

  /**
   * @param {string} key
   * @param {FsBlobStorageRemoveOptions} [options]
   * @returns {Promise<void>}
   */
  remove (key, options = {}) {
    const { ext = DEFAULT_EXT } = options
    const filepath = path.join(this.path, key + ext)
    return fsPromises.unlink(filepath)
  }
}

FsBlobStorage.FsBlobStorage = FsBlobStorage
FsBlobStorage.default = FsBlobStorage

module.exports = FsBlobStorage
