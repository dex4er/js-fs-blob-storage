"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const make_dir_1 = tslib_1.__importDefault(require("make-dir"));
const path_1 = tslib_1.__importDefault(require("path"));
const promisify = require('util.promisify');
const DEFAULT_EXT = '';
const DEFAULT_PART = '.part';
class FsBlobStorage {
    constructor(options = {}) {
        this.defaultExt = options.defaultExt !== undefined ? options.defaultExt : DEFAULT_EXT;
        this.defaultPart = options.defaultPart !== undefined ? options.defaultPart : DEFAULT_PART;
        this.writeFlags = options.exclusive ? 'wx' : 'w';
        this.fs = options.fs || fs_1.default;
        this.path = options.path || '.';
        this.fsPromises = {};
        for (const method of ['close', 'open', 'rename', 'stat', 'unlink']) {
            this.fsPromises[method] = promisify(this.fs[method]);
        }
    }
    createWriteStream(key, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { ext = this.defaultExt, part = this.defaultPart, encoding } = options;
            const filepath = path_1.default.join(this.path, key + ext);
            const dirpath = path_1.default.dirname(filepath);
            yield make_dir_1.default(dirpath, { fs: this.fs });
            // for exclusive mode it will reject if file already exist
            const fd = yield this.fsPromises.open(filepath, this.writeFlags);
            if (part) {
                // do `open` instead of `stat` to prevent race condition
                const fdPart = yield this.fsPromises.open(filepath + part, this.writeFlags);
                // `close` before `rename` just for Windows
                yield this.fsPromises.close(fdPart);
                // `rename` overwrites quietly the file
                yield this.fsPromises.rename(filepath, filepath + part);
            }
            // first argument is ignored
            return this.fs.createWriteStream(filepath + part, { fd, encoding });
        });
    }
    createReadStream(key, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { ext = this.defaultExt, encoding } = options;
            const filepath = path_1.default.join(this.path, key + ext);
            const fd = yield this.fsPromises.open(filepath, 'r');
            const stats = yield this.fsPromises.stat(filepath);
            if (!stats.size) {
                throw Object.assign(new Error(`ENOENT: empty file, open '${filepath}'`), { code: 'ENOENT', path: filepath });
            }
            return this.fs.createReadStream(filepath, { fd, encoding });
        });
    }
    commit(key, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { ext = this.defaultExt, part = this.defaultPart } = options;
            if (part) {
                const filepath = path_1.default.join(this.path, key + ext);
                return this.fsPromises.rename(filepath + part, filepath);
            }
        });
    }
    remove(key, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { ext = this.defaultExt } = options;
            const filepath = path_1.default.join(this.path, key + ext);
            return this.fsPromises.unlink(filepath);
        });
    }
}
exports.FsBlobStorage = FsBlobStorage;
exports.default = FsBlobStorage;
