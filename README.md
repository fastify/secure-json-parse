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

Machine: 2.4 Ghz 14-core Intel Core i7-13650HX

```
> benchmarks@1.0.0 valid
> node valid.js

JSON.parse x 1,866,229 ops/sec ±1.91% (86 runs sampled)
JSON.parse proto x 1,237,402 ops/sec ±1.32% (95 runs sampled)
secure-json-parse parse x 1,693,973 ops/sec ±0.99% (94 runs sampled)
secure-json-parse parse proto x 1,864,139 ops/sec ±0.86% (95 runs sampled)
secure-json-parse safeParse x 1,703,452 ops/sec ±0.46% (91 runs sampled)
secure-json-parse safeParse proto x 1,116,725 ops/sec ±0.62% (94 runs sampled)
JSON.parse reviver x 295,223 ops/sec ±0.39% (100 runs sampled)
Fastest is secure-json-parse parse proto

> benchmarks@1.0.0 ignore
> node ignore.js

JSON.parse x 1,227,994 ops/sec ±1.05% (90 runs sampled)
secure-json-parse parse x 1,184,011 ops/sec ±0.66% (95 runs sampled)
secure-json-parse safeParse x 1,123,041 ops/sec ±1.12% (92 runs sampled)
reviver x 196,637 ops/sec ±0.50% (99 runs sampled)
Fastest is JSON.parse

> benchmarks@1.0.0 no_proto
> node no__proto__.js

JSON.parse x 1,183,590 ops/sec ±0.43% (93 runs sampled)
secure-json-parse parse x 1,053,759 ops/sec ±0.76% (97 runs sampled)
secure-json-parse safeParse x 1,066,295 ops/sec ±0.60% (95 runs sampled)
reviver x 186,683 ops/sec ±0.61% (94 runs sampled)
Fastest is JSON.parse

> benchmarks@1.0.0 remove
> node remove.js

JSON.parse x 1,229,886 ops/sec ±1.43% (90 runs sampled)
secure-json-parse parse x 506,756 ops/sec ±0.39% (95 runs sampled)
secure-json-parse safeParse x 1,136,082 ops/sec ±0.84% (97 runs sampled)
reviver x 185,631 ops/sec ±1.09% (96 runs sampled)
Fastest is JSON.parse

> benchmarks@1.0.0 throw
> node throw.js

JSON.parse valid x 1,252,559 ops/sec ±1.04% (94 runs sampled)
JSON.parse error x 133,036 ops/sec ±1.35% (73 runs sampled)
secure-json-parse parse x 305,759 ops/sec ±0.80% (93 runs sampled)
secure-json-parse safeParse x 351,419 ops/sec ±0.85% (97 runs sampled)
reviver x 123,542 ops/sec ±0.46% (77 runs sampled)
Fastest is JSON.parse valid
```

## Acknowledgments
This project has been forked from [hapijs/bourne](https://github.com/hapijs/bourne).
All credit before commit [4690682](https://github.com/hapijs/bourne/commit/4690682c6cdaa06590da7b2485d5df91c09da889) goes to the hapijs/bourne project contributors.
After, the project will be maintained by the Fastify team.

## License
Licensed under [BSD-3-Clause](./LICENSE).
