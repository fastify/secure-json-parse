'use strict'

const { Bench } = require('tinybench')
const sjson = require('..')

const internals = {
  text: '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
}

internals.reviver = function (_key, value) {
  return value
}

const benchmark = new Bench({
  name: 'ignore benchmark',
  iterations: 10000,
  warmupIterations: 100
})

benchmark
  .add('JSON.parse', () => {
    JSON.parse(internals.text)
  })
  .add('secure-json-parse parse', () => {
    sjson.parse(internals.text, { protoAction: 'ignore' })
  })
  .add('secure-json-parse safeParse', () => {
    sjson.safeParse(internals.text)
  })
  .add('reviver', () => {
    JSON.parse(internals.text, internals.reviver)
  })
  .run()
  .then(() => {
    console.log(benchmark.name)
    console.table(benchmark.table())
  })
