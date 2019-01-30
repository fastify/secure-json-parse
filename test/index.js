'use strict';

const Code = require('code');
const Bourne = require('..');
const Lab = require('lab');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Bourne', () => {

    describe('parse()', () => {

        it('parses object string', () => {

            expect(Bourne.parse('{"a": 5, "b": 6}')).to.equal({ a: 5, b: 6 });
        });

        it('parses null string', () => {

            expect(Bourne.parse('null')).to.equal(null);
        });

        it('parses zero string', () => {

            expect(Bourne.parse('0')).to.equal(0);
        });

        it('parses string string', () => {

            expect(Bourne.parse('"x"')).to.equal('x');
        });

        it('parses object string (reviver)', () => {

            const reviver = (key, value) => {

                return typeof value === 'number' ? value + 1 : value;
            };

            expect(Bourne.parse('{"a": 5, "b": 6}', reviver)).to.equal({ a: 6, b: 7 });
        });

        it('sanitizes object string (reviver, options)', () => {

            const reviver = (key, value) => {

                return typeof value === 'number' ? value + 1 : value;
            };

            expect(Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', reviver, { protoAction: 'remove' })).to.equal({ a: 6, b: 7 });
        });

        it('sanitizes object string (options)', () => {

            expect(Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'remove' })).to.equal({ a: 5, b: 6 });
        });

        it('sanitizes object string (null, options)', () => {

            expect(Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', null, { protoAction: 'remove' })).to.equal({ a: 5, b: 6 });
        });

        it('sanitizes nested object string', () => {

            const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }';
            expect(Bourne.parse(text, { protoAction: 'remove' })).to.equal({ a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } });
        });

        it('errors on proto property', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')).to.throw(SyntaxError);
        });

        it('errors on proto property (null, null)', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', null, null)).to.throw(SyntaxError);
        });

        it('errors on proto property (explicit options)', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'error' })).to.throw(SyntaxError);
        });

        it('ignores proto property', () => {

            const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }';
            expect(Bourne.parse(text, { protoAction: 'ignore' })).to.equal(JSON.parse(text));
        });

        it('ignores proto value', () => {

            expect(Bourne.parse('{"a": 5, "b": "__proto__"}')).to.equal({ a: 5, b: '__proto__' });
        });
    });
});
