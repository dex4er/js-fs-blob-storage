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
 * @class
 * @param {Object} [options]
 * @param {string} [options.defaultExt]
 * @param {string} [options.defaultPart]
 * @param {boolean} [options.exclusive]
 * @param {string} [options.path]
 */
class FsBlobStorage {
  constructor (options = {}) {
    this.defaultExt = options.defaultExt !== undefined ? options.defaultExt : DEFAULT_EXT
    this.defaultPart = options.defaultPart !== undefined ? options.defaultPart : DEFAULT_PART
    this.writeFlags = options.exclusive ? 'wx' : 'w'
    this.path = options.path || '.'
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

      return makeDir(dirpath).then(() => {
        // for exclusive mode it will reject if file already exist
        return fsPromises.open(filepath, this.writeFlags)
      }).then((value) => {
        fd = value
        // do `open` instead of `stat` to prevent race condition
        return fsPromises.open(filepath + part, this.writeFlags)
      }).then((fdPart) => {
        // `close` before `rename` just for Windows
        return fsPromises.close(fdPart)
      }).then(() => {
        // `rename` overwrites quietly the file
        return fsPromises.rename(filepath, filepath + part)
      }).then(() => {
        // first argument is ignored
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
   * @async
   * @param {string} key
   * @param {Object} [options]
   * @param {string} [options.ext]
   * @param {string} [options.part]
   * @returns {Promise<void>}
   */
  commit (key, options = {}) {
    const { ext = this.defaultExt, part = this.defaultPart } = options
    if (part) {
      const filepath = path.join(this.path, key + ext)
      return fsPromises.rename(filepath + part, filepath)
    }
  }

  /**
   * @async
   * @param {string} key
   * @param {Object} [options]
   * @param {string} [options.ext]
   * @returns {Promise<void>}
   */
  remove (key, options = {}) {
    const { ext = this.defaultExt } = options
    const filepath = path.join(this.path, key + ext)
    return fsPromises.unlink(filepath)
  }
}

FsBlobStorage.FsBlobStorage = FsBlobStorage

module.exports = FsBlobStorage
