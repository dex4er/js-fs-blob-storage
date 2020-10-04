# fs-blob-storage

<!-- markdownlint-disable MD013 -->

[![Build Status](https://secure.travis-ci.org/dex4er/js-fs-blob-storage.svg)](http://travis-ci.org/dex4er/js-fs-blob-storage) [![Coverage Status](https://coveralls.io/repos/github/dex4er/js-fs-blob-storage/badge.svg)](https://coveralls.io/github/dex4er/js-fs-blob-storage) [![npm](https://img.shields.io/npm/v/fs-blob-storage.svg)](https://www.npmjs.com/package/fs-blob-storage)

<!-- markdownlint-enable MD013 -->

Blob storage on filesystem, with streams and promises API.

Features:

- Simple API
- Read and write file streams
- Partial files
- Safe, atomic operations
- Works with any POSIX or NTFS filesystem
- NFS friendly locking

## Requirements

This module requires Node >= 10.

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
const {FsBlobStorage, DEFAULT_EXT, DEFAULT_PART} = require("fs-blob-storage")
```

_Typescript:_

```ts
import FsBlobStorage from "fs-blob-storage"
// or
import {FsBlobStorage, DEFAULT_EXT, DEFAULT_PART} from "fs-blob-storage"
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

- `ext` is a default extension added to file name for the object (optional,
  default: `this.ext`)
- `part` is a extension added to file name which can be later commited
  (optional, default: `this.part`)
- `encoding` is a encoding for created file (optional, default: `null`)

Creates a writable stream for a new object in the storage. Object is stored with
the file name based on `key` and `ext` and `part`. Throws an error if has
occurred and if the file already exists for exclusive mode.

### createReadStream

```js
const readable = await storage.createWriteStream(key, options)
```

_Options:_

- `ext` is a default extension added to file name for the object (optional,
  default: '')
- `encoding` is a encoding for created file (optional, default: 'utf8')

Creates a readable stream for an existing object in the storage. Throws an error
if has occurred or the object doesn't exist or its size is zero.

### commit

```js
await storage.commit(key, options)
```

_Options:_

- `ext` is a default extension added to file name for the object (optional,
  default: `this.ext`)
- `part` is a extension added to file name which can be later commited
  (optional, default: `this.part`)

Commits the object in the storage. It means that file name for the object is
renamed and the additional extension for partial objects is removed. Throws an
error if has occurred or the object doesn't exist.

### remove

```js
await storage.remove(key, options)
```

_Options:_

- `ext` is a default extension added to file name for the object (optional,
  default: `this.ext`)

Removes the object from the storage. Throws an error if has occurred or the
object doesn't exist.

## Bugs

This storage doesn't work correctly on NTFS filesystem mounted in Linux in
VirtualBox. In this case no partial files should be used.

## License

Copyright (c) 2018-2019 Piotr Roszatycki <piotr.roszatycki@gmail.com>

[MIT](https://opensource.org/licenses/MIT)
