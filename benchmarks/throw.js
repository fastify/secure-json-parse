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
        try {
            Bourne.parse(text);
        } catch (e) {
        }
    })
    .add('reviver', function() {
        try {
            JSON.parse(text, reviver);
        } catch (e) {
        }
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
        throw new Error('kaboom')
    }
    return obj
}
