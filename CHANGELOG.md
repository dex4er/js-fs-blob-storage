# Changelog

## v0.6.0 2018-07-16

* New option `fs` with File System module.
* Tests don't use `mock-fs` package anymore.
* Tweaked jsdoc.

## v0.5.2 2018-05-24

* Uses `stream.pipeline-shim` package for examples.

## v0.5.1 2018-05-24

* Call `close` before `rename` to make storage compatible with Windows.

## v0.5.0 2018-05-19

* New constructor option `defaultExt` and `defaultPart`.

## v0.4.1 2018-05-18

* Uses `stream.pipeline` shim instead `pump` in example scripts.

## v0.4.0 2018-05-15

* Breaking change: `encoding` is `null` by default and then storage object
  returns `Buffer`.

## v0.3.0 2018-05-13

* Typescript: return fs.WriteStream or fs.ReadStream.

## v0.2.1 2018-05-13

* Bugfix: write to .part file if `part` option is set.

## v0.2.0 2018-05-10

* Builds with Node 10.
* Uses `util.promisify` instead of `mz`.

## v0.1.0 2018-05-06

* Initial release
