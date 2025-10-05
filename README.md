# secure-json-parse

[![CI](https://github.com/fastify/secure-json-parse/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastify/secure-json-parse/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/secure-json-parse.svg?style=flat)](https://www.npmjs.com/package/secure-json-parse)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

`JSON.parse()` drop-in replacement with prototype poisoning protection.

## Introduction

Consider this:

```js
> const a = '{"__proto__":{ "b":5}}';
'{"__proto__":{ "b":5}}'

> const b = JSON.parse(a);
{ __proto__: { b: 5 } }

> b.b;
undefined

> const c = Object.assign({}, b);
{}

> c.b
5
```

The problem is that `JSON.parse()` retains the `__proto__` property as a plain object key. By
itself, this is not a security issue. However, as soon as that object is assigned to another or
iterated on and values copied, the `__proto__` property leaks and becomes the object's prototype.

## Install
```
npm i secure-json-parse
```

## Usage

Pass the option object as a second (or third) parameter for configuring the action to take in case of a bad JSON, if nothing is configured, the default is to throw a `SyntaxError`.<br/>
You can choose which action to perform in case `__proto__` is present, and in case `constructor.prototype` is present.

```js
const sjson = require('secure-json-parse')

const goodJson = '{ "a": 5, "b": 6 }'
const badJson = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "constructor": {"prototype": {"bar": "baz"} } }'

console.log(JSON.parse(goodJson), sjson.parse(goodJson, undefined, { protoAction: 'remove', constructorAction: 'remove' }))
console.log(JSON.parse(badJson), sjson.parse(badJson, undefined, { protoAction: 'remove', constructorAction: 'remove' }))
```

## API

### `sjson.parse(text, [reviver], [options])`

Parses a given JSON-formatted text into an object where:
- `text` - the JSON text string.
- `reviver` - the `JSON.parse()` optional `reviver` argument.
- `options` - optional configuration object where:
    - `protoAction` - optional string with one of:
        - `'error'` - throw a `SyntaxError` when a `__proto__` key is found. This is the default value.
        - `'remove'` - deletes any `__proto__` keys from the result object.
        - `'ignore'` - skips all validation (same as calling `JSON.parse()` directly).
    - `constructorAction` - optional string with one of:
        - `'error'` - throw a `SyntaxError` when a `constructor.prototype` key is found. This is the default value.
        - `'remove'` - deletes any `constructor` keys from the result object.
        - `'ignore'` - skips all validation (same as calling `JSON.parse()` directly).
    - `safe` - optional boolean:
        - `true` - returns `null` instead of throwing when a forbidden prototype property is found.
        - `false` - default behavior (throws or removes based on `protoAction`/`constructorAction`).

### `sjson.scan(obj, [options])`

Scans a given object for prototype properties where:
- `obj` - the object being scanned.
- `options` - optional configuration object where:
    - `protoAction` - optional string with one of:
        - `'error'` - throw a `SyntaxError` when a `__proto__` key is found. This is the default value.
        - `'remove'` - deletes any `__proto__` keys from the input `obj`.
    - `constructorAction` - optional string with one of:
        - `'error'` - throw a `SyntaxError` when a `constructor.prototype` key is found. This is the default value.
        - `'remove'` - deletes any `constructor` keys from the input `obj`.
    - `safe` - optional boolean:
        - `true` - returns `null` instead of throwing when a forbidden prototype property is found.
        - `false` - default behavior (throws or removes based on `protoAction`/`constructorAction`).

## Benchmarks

Machine: 2.4 GHz 14-core Intel Core i7-13670HX

```
v22.20.0

> node valid.js

JSON.parse x 1,802,844 ops/sec ±1.79% (88 runs sampled)
JSON.parse proto x 1,219,302 ops/sec ±2.10% (92 runs sampled)
secure-json-parse parse x 1,657,400 ops/sec ±1.65% (94 runs sampled)
secure-json-parse parse proto x 1,807,648 ops/sec ±2.41% (90 runs sampled)
secure-json-parse safeParse x 1,652,255 ops/sec ±1.50% (93 runs sampled)
secure-json-parse safeParse proto x 1,103,083 ops/sec ±1.73% (93 runs sampled)
JSON.parse reviver x 287,161 ops/sec ±2.37% (91 runs sampled)
Fastest is secure-json-parse parse proto

> node ignore.js

JSON.parse x 1,210,169 ops/sec ±1.44% (92 runs sampled)
secure-json-parse parse x 1,158,560 ops/sec ±1.14% (95 runs sampled)
secure-json-parse safeParse x 1,124,013 ops/sec ±0.67% (98 runs sampled)
reviver x 196,308 ops/sec ±0.57% (92 runs sampled)
Fastest is JSON.parse

> node no__proto__.js

JSON.parse x 1,159,929 ops/sec ±1.19% (88 runs sampled)
secure-json-parse parse x 1,057,914 ops/sec ±0.55% (96 runs sampled)
secure-json-parse safeParse x 1,049,393 ops/sec ±1.37% (95 runs sampled)
reviver x 185,783 ops/sec ±0.72% (94 runs sampled)
Fastest is JSON.parse

> node remove.js

JSON.parse x 1,247,924 ops/sec ±0.94% (94 runs sampled)
secure-json-parse parse x 487,633 ops/sec ±1.62% (91 runs sampled)
secure-json-parse safeParse x 1,124,136 ops/sec ±0.85% (97 runs sampled)
reviver x 183,020 ops/sec ±1.41% (95 runs sampled)
Fastest is JSON.parse

> node throw.js

JSON.parse valid x 1,234,770 ops/sec ±0.64% (90 runs sampled)
JSON.parse error x 126,202 ops/sec ±2.22% (82 runs sampled)
secure-json-parse parse x 292,250 ops/sec ±1.74% (94 runs sampled)
secure-json-parse safeParse x 331,809 ops/sec ±2.72% (89 runs sampled)
reviver x 119,842 ops/sec ±1.24% (79 runs sampled)
Fastest is JSON.parse valid
```

## Acknowledgments
This project has been forked from [hapijs/bourne](https://github.com/hapijs/bourne).
All credit before commit [4690682](https://github.com/hapijs/bourne/commit/4690682c6cdaa06590da7b2485d5df91c09da889) goes to the hapijs/bourne project contributors.
After, the project will be maintained by the Fastify team.

## License
Licensed under [BSD-3-Clause](./LICENSE).
