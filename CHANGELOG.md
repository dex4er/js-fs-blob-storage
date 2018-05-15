# Changelog

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
