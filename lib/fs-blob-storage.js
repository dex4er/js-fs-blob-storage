const fs = require('fs')
const makeDir = require('make-dir')
const path = require('path')
const promisify = require('util.promisify')

const DEFAULT_EXT = ''
const DEFAULT_PART = '.part'

/**
 * @class
 * @param {Object} [options]
 * @param {string} [options.defaultExt]
 * @param {string} [options.defaultPart]
 * @param {boolean} [options.exclusive]
 * @param {Object} [options.fs]
 * @param {string} [options.path]
 */
class FsBlobStorage {
  constructor (options = {}) {
    this.defaultExt = options.defaultExt !== undefined ? options.defaultExt : DEFAULT_EXT
    this.defaultPart = options.defaultPart !== undefined ? options.defaultPart : DEFAULT_PART
    this.writeFlags = options.exclusive ? 'wx' : 'w'
    this.fs = options.fs || fs
    this.path = options.path || '.'

    this.fsPromises = {}
    for (const method of ['close', 'open', 'rename', 'stat', 'unlink']) {
      this.fsPromises[method] = promisify(this.fs[method])
    }
  }

  /**
   * @async
   * @param {string} key
   * @param {Object} [options]
   * @param {string} [options.ext]
   * @param {string} [options.part]
   * @param {string} [options.encoding]
   * @returns {Promise<Writable>}
   */
  createWriteStream (key, options = {}) {
    const { ext = this.defaultExt, part = this.defaultPart, encoding = null } = options
    const filepath = path.join(this.path, key + ext)
    const dirpath = path.dirname(filepath)

    if (part) {
      let fd

      return makeDir(dirpath, { fs: this.fs }).then(() => {
        // for exclusive mode it will reject if file already exist
        return this.fsPromises.open(filepath, this.writeFlags)
      }).then((value) => {
        fd = value
        // do `open` instead of `stat` to prevent race condition
        return this.fsPromises.open(filepath + part, this.writeFlags)
      }).then((fdPart) => {
        // `close` before `rename` just for Windows
        return this.fsPromises.close(fdPart)
      }).then(() => {
        // `rename` overwrites quietly the file
        return this.fsPromises.rename(filepath, filepath + part)
      }).then(() => {
        // first argument is ignored
        return this.fs.createWriteStream(filepath + part, { fd, encoding })
      })
    }

    return makeDir(dirpath, { fs: this.fs }).then(() => {
      return this.fsPromises.open(filepath, this.writeFlags)
    }).then((fd) => {
      return this.fs.createWriteStream(filepath, { fd, encoding })
    })
  }

  /**
   * @async
   * @param {string} key
   * @param {Object} [options]
   * @param {string} [options.ext]
   * @param {string} [options.encoding]
   * @returns {Promise<Readable>}
   */
  createReadStream (key, options = {}) {
    const { ext = this.defaultExt, encoding = null } = options
    const filepath = path.join(this.path, key + ext)

    let fd

    return this.fsPromises.open(filepath, 'r').then((value) => {
      fd = value
      return this.fsPromises.stat(filepath)
    }).then((stats) => {
      if (!stats.size) {
        return Promise.reject(Object.assign(new Error(`ENOENT: empty file, open '${filepath}'`), { code: 'ENOENT', path: filepath }))
      }

      return this.fs.createReadStream(filepath, { fd, encoding })
    })
  }

  /**
   * @async
   * @param {string} key
   * @param {Object} [options]
   * @param {string} [options.ext]
   * @param {string} [options.part]
   * @returns {Promise<undefined>}
   */
  commit (key, options = {}) {
    const { ext = this.defaultExt, part = this.defaultPart } = options
    if (part) {
      const filepath = path.join(this.path, key + ext)
      return this.fsPromises.rename(filepath + part, filepath)
    }
  }

  /**
   * @async
   * @param {string} key
   * @param {Object} [options]
   * @param {string} [options.ext]
   * @returns {Promise<undefined>}
   */
  remove (key, options = {}) {
    const { ext = this.defaultExt } = options
    const filepath = path.join(this.path, key + ext)
    return this.fsPromises.unlink(filepath)
  }
}

FsBlobStorage.FsBlobStorage = FsBlobStorage

module.exports = FsBlobStorage
