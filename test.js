'use strict'

const test = require('tap').test
const j = require('./index')

test('parse', t => {
  t.test('parses object string', t => {
    t.deepEqual(
      j.parse('{"a": 5, "b": 6}'),
      JSON.parse('{"a": 5, "b": 6}')
    )
    t.end()
  })

  t.test('parses null string', t => {
    t.strictEqual(
      j.parse('null'),
      JSON.parse('null')
    )
    t.end()
  })

  t.test('parses 0 string', t => {
    t.strictEqual(
      j.parse('0'),
      JSON.parse('0')
    )
    t.end()
  })

  t.test('parses string string', t => {
    t.strictEqual(
      j.parse('"X"'),
      JSON.parse('"X"')
    )
    t.end()
  })

  t.test('parses object string (reviver)', t => {
    const reviver = (key, value) => {
      return typeof value === 'number' ? value + 1 : value
    }

    t.deepEqual(
      j.parse('{"a": 5, "b": 6}', reviver),
      JSON.parse('{"a": 5, "b": 6}', reviver)
    )
    t.end()
  })

  t.test('sanitizes object string (reviver, options)', t => {
    const reviver = (key, value) => {
      return typeof value === 'number' ? value + 1 : value
    }

    t.deepEqual(
      j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', reviver, { protoAction: 'remove' }),
      { a: 6, b: 7 }
    )
    t.end()
  })

  t.test('sanitizes object string (options)', t => {
    t.deepEqual(
      j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', { protoAction: 'remove' }),
      { a: 5, b: 6 }
    )
    t.end()
  })

  t.test('sanitizes object string (null, options)', t => {
    t.deepEqual(
      j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', null, { protoAction: 'remove' }),
      { a: 5, b: 6 }
    )
    t.end()
  })

  t.test('sanitizes object string (null, options)', t => {
    t.deepEqual(
      j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', { protoAction: 'remove' }),
      { a: 5, b: 6 }
    )
    t.end()
  })

  t.test('sanitizes nested object string', t => {
    t.deepEqual(
      j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }', { protoAction: 'remove' }),
      { a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } }
    )
    t.end()
  })

  t.test('ignores proto property', t => {
    t.deepEqual(
      j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'ignore' }),
      JSON.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')
    )
    t.end()
  })

  t.test('ignores proto value', t => {
    t.deepEqual(
      j.parse('{"a": 5, "b": "__proto__"}'),
      { a: 5, b: '__proto__' }
    )
    t.end()
  })

  t.test('errors on proto property', t => {
    t.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__" : { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__" \n\r\t : { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__" \n \r \t : { "x": 7 } }'), SyntaxError)
    t.end()
  })

  t.test('errors on proto property (null, null)', t => {
    t.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', null, null), SyntaxError)
    t.end()
  })

  t.test('errors on proto property (explicit options)', t => {
    t.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'error' }), SyntaxError)
    t.end()
  })

  t.test('errors on proto property (unicode)', t => {
    t.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005f_proto__": { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "_\\u005fp\\u0072oto__": { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005f\\u005f\\u0070\\u0072\\u006f\\u0074\\u006f\\u005f\\u005f": { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005F_proto__": { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "_\\u005Fp\\u0072oto__": { "x": 7 } }'), SyntaxError)
    t.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005F\\u005F\\u0070\\u0072\\u006F\\u0074\\u006F\\u005F\\u005F": { "x": 7 } }'), SyntaxError)
    t.end()
  })

  t.end()
})

test('scan', t => {
  t.test('sanitizes nested object string', t => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    const obj = JSON.parse(text)

    j.scan(obj, { protoAction: 'remove' })
    t.deepEqual(obj, { a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } })
    t.end()
  })

  t.test('errors on proto property', t => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    const obj = JSON.parse(text)

    t.throws(() => j.scan(obj), SyntaxError)
    t.end()
  })

  t.test('does not break when hasOwnProperty is overwritten', t => {
    const text = '{ "a": 5, "b": 6, "hasOwnProperty": "text", "__proto__": { "x": 7 } }'
    const obj = JSON.parse(text)

    j.scan(obj, { protoAction: 'remove' })
    t.deepEqual(obj, { a: 5, b: 6, hasOwnProperty: 'text' })
    t.end()
  })

  t.end()
})

test('safeParse', t => {
  t.test('parses object string', t => {
    t.deepEqual(
      j.safeParse('{"a": 5, "b": 6}'),
      { a: 5, b: 6 }
    )
    t.end()
  })

  t.test('returns null on proto object string', t => {
    t.strictEqual(
      j.safeParse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'),
      null
    )
    t.end()
  })

  t.test('returns null on invalid object string', t => {
    t.strictEqual(
      j.safeParse('{"a": 5, "b": 6'),
      null
    )
    t.end()
  })

  t.end()
})
