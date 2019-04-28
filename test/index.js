'use strict';

const Code = require('@hapi/code');
const Bourne = require('..');
const Lab = require('@hapi/lab');


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

        it('ignores proto property', () => {

            const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }';
            expect(Bourne.parse(text, { protoAction: 'ignore' })).to.equal(JSON.parse(text));
        });

        it('ignores proto value', () => {

            expect(Bourne.parse('{"a": 5, "b": "__proto__"}')).to.equal({ a: 5, b: '__proto__' });
        });

        it('errors on proto property', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')).to.throw(SyntaxError);
            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__" : { "x": 7 } }')).to.throw(SyntaxError);
            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__" \n\r\t : { "x": 7 } }')).to.throw(SyntaxError);
            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__" \n \r \t : { "x": 7 } }')).to.throw(SyntaxError);
        });

        it('errors on proto property (null, null)', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', null, null)).to.throw(SyntaxError);
        });

        it('errors on proto property (explicit options)', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'error' })).to.throw(SyntaxError);
        });

        it('errors on proto property (unicode)', () => {

            expect(() => Bourne.parse('{ "a": 5, "b": 6, "\\u005f_proto__": { "x": 7 } }')).to.throw(SyntaxError);
            expect(() => Bourne.parse('{ "a": 5, "b": 6, "_\\u005fp\\u0072oto__": { "x": 7 } }')).to.throw(SyntaxError);
            expect(() => Bourne.parse('{ "a": 5, "b": 6, "\\u005f\\u005f\\u0070\\u0072\\u006f\\u0074\\u006f\\u005f\\u005f": { "x": 7 } }')).to.throw(SyntaxError);
        });
    });

    describe('scan()', () => {

        it('sanitizes nested object string', () => {

            const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }';
            const obj = JSON.parse(text);

            Bourne.scan(obj, { protoAction: 'remove' });
            expect(obj).to.equal({ a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } });
        });

        it('errors on proto property', () => {

            const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }';
            const obj = JSON.parse(text);

            expect(() => Bourne.scan(obj)).to.throw(SyntaxError);
        });

        it('does not break when hasOwnProperty is overwritten', () => {

            const text = '{ "a": 5, "b": 6, "hasOwnProperty": "text", "__proto__": { "x": 7 } }';
            const obj = JSON.parse(text);

            Bourne.scan(obj, { protoAction: 'remove' });
            expect(obj).to.equal({ a: 5, b: 6, hasOwnProperty: 'text' });
        });
    });

    describe('safeParse()', () => {

        it('parses object string', () => {

            expect(Bourne.safeParse('{"a": 5, "b": 6}')).to.equal({ a: 5, b: 6 });
        });

        it('returns null on proto object string', () => {

            expect(Bourne.safeParse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')).to.be.null();
        });

        it('returns null on invalid object string', () => {

            expect(Bourne.safeParse('{"a": 5, "b": 6')).to.be.null();
        });
    });
});
