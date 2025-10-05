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
v22.20.0

> benchmarks@1.0.0 valid
> node valid.js

valid benchmark
┌─────────┬─────────────────────────────────────┬──────────────────┬──────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name                           │ Latency avg (ns) │ Latency med (ns) │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼─────────────────────────────────────┼──────────────────┼──────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'JSON.parse'                        │ '610.10 ± 0.39%' │ '600.00 ± 0.00'  │ '1740515 ± 0.02%'      │ '1666667 ± 0'          │ 1639075 │
│ 1       │ 'JSON.parse proto'                  │ '875.42 ± 0.39%' │ '800.00 ± 0.00'  │ '1210508 ± 0.03%'      │ '1250000 ± 0'          │ 1142308 │
│ 2       │ 'secure-json-parse parse'           │ '634.34 ± 0.32%' │ '600.00 ± 0.00'  │ '1624445 ± 0.01%'      │ '1666667 ± 0'          │ 1576434 │
│ 3       │ 'secure-json-parse parse proto'     │ '657.25 ± 0.42%' │ '600.00 ± 0.00'  │ '1666577 ± 0.03%'      │ '1666667 ± 0'          │ 1521499 │
│ 4       │ 'secure-json-parse safeParse'       │ '646.03 ± 1.68%' │ '600.00 ± 0.00'  │ '1622543 ± 0.02%'      │ '1666667 ± 0'          │ 1547914 │
│ 5       │ 'secure-json-parse safeParse proto' │ '912.34 ± 0.20%' │ '900.00 ± 0.00'  │ '1122250 ± 0.02%'      │ '1111111 ± 0'          │ 1096080 │
│ 6       │ 'JSON.parse reviver'                │ '3448.5 ± 0.59%' │ '3200.0 ± 0.00'  │ '300173 ± 0.04%'       │ '312500 ± 0'           │ 289982  │
└─────────┴─────────────────────────────────────┴──────────────────┴──────────────────┴────────────────────────┴────────────────────────┴─────────┘

> benchmarks@1.0.0 ignore
> node ignore.js

ignore benchmark
┌─────────┬───────────────────────────────┬──────────────────┬───────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name                     │ Latency avg (ns) │ Latency med (ns)  │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼───────────────────────────────┼──────────────────┼───────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'JSON.parse'                  │ '897.15 ± 0.53%' │ '800.00 ± 0.00'   │ '1201546 ± 0.03%'      │ '1250000 ± 0'          │ 1114647 │
│ 1       │ 'secure-json-parse parse'     │ '891.22 ± 0.45%' │ '800.00 ± 0.00'   │ '1168492 ± 0.02%'      │ '1250000 ± 0'          │ 1122056 │
│ 2       │ 'secure-json-parse safeParse' │ '938.74 ± 0.56%' │ '900.00 ± 0.00'   │ '1106881 ± 0.02%'      │ '1111111 ± 0'          │ 1065255 │
│ 3       │ 'reviver'                     │ '5741.8 ± 0.79%' │ '4900.0 ± 100.00' │ '188823 ± 0.08%'       │ '204082 ± 4252'        │ 174162  │
└─────────┴───────────────────────────────┴──────────────────┴───────────────────┴────────────────────────┴────────────────────────┴─────────┘

> benchmarks@1.0.0 no_proto
> node no__proto__.js

no __proto__ benchmark
┌─────────┬───────────────────────────────┬──────────────────┬───────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name                     │ Latency avg (ns) │ Latency med (ns)  │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼───────────────────────────────┼──────────────────┼───────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'JSON.parse'                  │ '930.41 ± 0.56%' │ '800.00 ± 0.00'   │ '1154630 ± 0.03%'      │ '1250000 ± 0'          │ 1074798 │
│ 1       │ 'secure-json-parse parse'     │ '996.09 ± 0.27%' │ '900.00 ± 0.00'   │ '1039752 ± 0.02%'      │ '1111111 ± 0'          │ 1003921 │
│ 2       │ 'secure-json-parse safeParse' │ '1050.5 ± 7.38%' │ '900.00 ± 0.00'   │ '1038060 ± 0.02%'      │ '1111111 ± 0'          │ 951942  │
│ 3       │ 'reviver'                     │ '5424.7 ± 3.23%' │ '5100.0 ± 100.00' │ '192362 ± 0.05%'       │ '196078 ± 3922'        │ 184341  │
└─────────┴───────────────────────────────┴──────────────────┴───────────────────┴────────────────────────┴────────────────────────┴─────────┘

> benchmarks@1.0.0 remove
> node remove.js

remove benchmark
┌─────────┬───────────────────────────────┬──────────────────┬───────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name                     │ Latency avg (ns) │ Latency med (ns)  │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼───────────────────────────────┼──────────────────┼───────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'JSON.parse'                  │ '927.86 ± 0.51%' │ '800.00 ± 0.00'   │ '1161336 ± 0.03%'      │ '1250000 ± 0'          │ 1077745 │
│ 1       │ 'secure-json-parse parse'     │ '1968.1 ± 0.51%' │ '1900.0 ± 100.00' │ '525418 ± 0.02%'       │ '526316 ± 26316'       │ 508117  │
│ 2       │ 'secure-json-parse safeParse' │ '930.60 ± 0.19%' │ '900.00 ± 0.00'   │ '1103037 ± 0.02%'      │ '1111111 ± 0'          │ 1074579 │
│ 3       │ 'reviver'                     │ '5531.4 ± 0.36%' │ '5100.0 ± 100.00' │ '187392 ± 0.06%'       │ '196078 ± 3922'        │ 180786  │
└─────────┴───────────────────────────────┴──────────────────┴───────────────────┴────────────────────────┴────────────────────────┴─────────┘

> benchmarks@1.0.0 throw
> node throw.js

throw benchmark
┌─────────┬───────────────────────────────┬──────────────────┬───────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name                     │ Latency avg (ns) │ Latency med (ns)  │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼───────────────────────────────┼──────────────────┼───────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'JSON.parse valid'            │ '908.52 ± 0.54%' │ '800.00 ± 0.00'   │ '1178218 ± 0.03%'      │ '1250000 ± 0'          │ 1100690 │
│ 1       │ 'JSON.parse error'            │ '7993.2 ± 0.54%' │ '7600.0 ± 200.00' │ '128668 ± 0.06%'       │ '131579 ± 3374'        │ 125108  │
│ 2       │ 'secure-json-parse parse'     │ '3436.4 ± 2.67%' │ '3100.0 ± 100.00' │ '312206 ± 0.05%'       │ '322581 ± 10081'       │ 291001  │
│ 3       │ 'secure-json-parse safeParse' │ '2800.9 ± 0.33%' │ '2700.0 ± 0.00'   │ '364670 ± 0.03%'       │ '370370 ± 0'           │ 357026  │
│ 4       │ 'reviver'                     │ '9045.6 ± 1.12%' │ '8300.0 ± 200.00' │ '115581 ± 0.08%'       │ '120482 ± 2975'        │ 110552  │
└─────────┴───────────────────────────────┴──────────────────┴───────────────────┴────────────────────────┴────────────────────────┴─────────┘
```

## Acknowledgments
This project has been forked from [hapijs/bourne](https://github.com/hapijs/bourne).
All credit before commit [4690682](https://github.com/hapijs/bourne/commit/4690682c6cdaa06590da7b2485d5df91c09da889) goes to the hapijs/bourne project contributors.
After, the project will be maintained by the Fastify team.

## License
Licensed under [BSD-3-Clause](./LICENSE).
