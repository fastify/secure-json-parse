'use strict'

const { Bench } = require('tinybench')
const sjson = require('..')

const internals = {
  text: '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }',
  invalid: '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } } }'
}

internals.reviver = function (key, value) {
  if (key === '__proto__') {
    throw new Error('kaboom')
  }

  return value
}

const benchmark = new Bench({
  name: 'throw benchmark',
  iterations: 10000,
  warmupIterations: 100
})

benchmark
  .add('JSON.parse valid', () => {
    JSON.parse(internals.text)
  })
  .add('JSON.parse error', () => {
    try {
      JSON.parse(internals.invalid)
    } catch { }
  })
  .add('secure-json-parse parse', () => {
    try {
      sjson.parse(internals.invalid)
    } catch { }
  })
  .add('secure-json-parse safeParse', () => {
    sjson.safeParse(internals.invalid)
  })
  .add('reviver', () => {
    try {
      JSON.parse(internals.invalid, internals.reviver)
    } catch { }
  })
  .run()
  .then(() => {
    console.log(benchmark.name)
    console.table(benchmark.table())
  })
