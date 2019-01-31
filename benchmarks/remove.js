'use strict'

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();
const Bourne = require('..')

const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }';

suite
    .add('JSON.parse', function() {
        JSON.parse(text)
    })
    .add('Bourne.parse', function() {
        Bourne.parse(text, { protoAction: 'remove' })
    })
    .add('reviver', function() {
        JSON.parse(text, reviver);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: true });


function reviver (key, obj) {
    if (key === '__proto__') {
        return undefined
    }
    return obj
}
