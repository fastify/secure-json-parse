'use strict'

const Benchmark = require('benchmark')
const sjson = require('..')

const internals = {
  text: '{ "a": 5, "b": 6, "c": { "d": 0, "e": "text", "f": { "g": 2 } } }'
}

const suite = new Benchmark.Suite()

suite
  .add('JSON.parse', () => {
    JSON.parse(internals.text)
  })
  .add('secure-json-parse parse', () => {
    sjson.parse(internals.text)
  })
  .add('secure-json-parse safeParse', () => {
    sjson.safeParse(internals.text)
  })
  .add('JSON.parse reviver', () => {
    JSON.parse(internals.text, internals.reviver)
  })
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })

internals.reviver = function (key, value) {
  if (key === '__proto__') {
    return undefined
  }

  return value
}
