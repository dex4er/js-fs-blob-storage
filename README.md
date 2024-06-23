# fs-blob-storage

<!-- markdownlint-disable MD013 -->

[![GitHub](https://img.shields.io/github/v/release/dex4er/js-fs-blob-storage?display_name=tag&sort=semver)](https://github.com/dex4er/js-fs-blob-storage)
[![CI](https://github.com/dex4er/js-fs-blob-storage/actions/workflows/ci.yaml/badge.svg)](https://github.com/dex4er/js-fs-blob-storage/actions/workflows/ci.yaml)
[![Trunk Check](https://github.com/dex4er/js-fs-blob-storage/actions/workflows/trunk.yaml/badge.svg)](https://github.com/dex4er/js-fs-blob-storage/actions/workflows/trunk.yaml)
[![Coverage Status](https://coveralls.io/repos/github/dex4er/js-fs-blob-storage/badge.svg)](https://coveralls.io/github/dex4er/js-fs-blob-storage)
[![npm](https://img.shields.io/npm/v/fs-blob-storage.svg)](https://www.npmjs.com/package/fs-blob-storage)

<!-- markdownlint-enable MD013 -->

Blob storage on a filesystem, with streams and promises API.

Features:

- Simple API
- Read and write file streams
- Partial files
- Safe, atomic operations
- Works with any POSIX or NTFS filesystem
- NFS friendly locking

## Requirements

This module requires Node >= 16.

## Installation

```shell
npm install fs-blob-storage
```

_Additionally for Typescript:_

```shell
npm install -D @types/node
```

## Usage

```js
import FsBlobStorage, {DEFAULT_EXT, DEFAULT_PART} from "fs-blob-storage"
```

### DEFAULT_EXT

The default `ext` option is `''`

### DEFAULT_PART

The default `part` option is `'.part'`

### constructor

```js
const storage = new FsBlobStorage(options)
```

_Options:_

- `ext` is a default `ext` argument for methods (optional, default:
  `DEFAULT_EXT`)
- `part` is a default `part` argument for methods (optional, default:
  `DEFAULT_PART`)
- `exclusive` if is true then can't create new object if already exists with
  the same key (optional, default: `false`)
- `fs` is a [File System](https://nodejs.org/api/fs.html) module (optional,
  default: `require('fs')`)
- `path` is a directory path of the storage (optional, default: `'.'`)

_Example:_

```js
const storage = new FsBlobStorage({
  part: ".lock",
  path: "/var/spool/mail",
  exclusive: true,
})
```

### createWriteStream

```js
const writable = await storage.createWriteStream(key, options)
```

_Options:_

- `ext` is a default extension added to the file name for the object
  (optional, default: `this.ext`)
- `part` is an extension added to the file name which can be later committed
  (optional, default: `this.part`)
- `encoding` is an encoding for a created file (optional, default: `null`)

Creates a writable stream for a new object in the storage. An object is
stored with the file name based on `key`, `ext` and `part`. Throws an
error if has occurred and if the file already exists for exclusive mode.

### createReadStream

```js
const readable = await storage.createWriteStream(key, options)
```

_Options:_

- `ext` is a default extension added to the file name for the object
  (optional, default: '')
- `encoding` is an encoding for a created file (optional, default: 'utf8')

Creates a readable stream for an existing object in the storage. Throws an error
if has occurred or if the object doesn't exist or its size is zero.

### commit

```js
await storage.commit(key, options)
```

_Options:_

- `ext` is a default extension added to the file name for the object
  (optional, default: `this.ext`)
- `part` is an extension added to the file name which can be later committed
  (optional, default: `this.part`)

Commits the object in the storage. It means that the file name for the object
is renamed and the additional extension for partial objects is removed.
Throws an error if has occurred or the object doesn't exist.

### remove

```js
await storage.remove(key, options)
```

_Options:_

- `ext` is a default extension added to the file name for the object
  (optional, default: `this.ext`)

Removes the object from the storage. Throws an error if has occurred or the
object doesn't exist.

## Bugs

This storage doesn't work correctly on the NTFS filesystem mounted in Linux
in VirtualBox. In this case, no partial files should be used.

## License

Copyright (c) 2018-2024 Piotr Roszatycki <piotr.roszatycki@gmail.com>

[MIT](https://opensource.org/licenses/MIT)
