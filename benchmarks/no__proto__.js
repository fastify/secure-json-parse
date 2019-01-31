'use strict';

const Benchmark = require('benchmark');
const Bourne = require('..');


const internals = {
    text: '{ "a": 5, "b": 6, "proto": { "x": 7 }, "c": { "d": 0, "e": "text", "proto": { "y": 8 }, "f": { "g": 2 } } }'
};


const suite = new Benchmark.Suite();


suite
    .add('JSON.parse', () => {

        JSON.parse(internals.text);
    })
    .add('Bourne.parse', () => {

        Bourne.parse(internals.text);
    })
    .add('reviver', () => {

        JSON.parse(internals.text, internals.reviver);
    })
    .on('cycle', (event) => {

        console.log(String(event.target));
    })
    .on('complete', function () {

        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: true });


internals.reviver = function (key, value) {

    if (key === '__proto__') {
        return undefined;
    }

    return value;
};
