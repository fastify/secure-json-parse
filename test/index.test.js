'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const j = require('..')

test('parse', async (t) => {
  await t.test('parses object string', () => {
    assert.deepEqual(
      j.parse('{"a": 5, "b": 6}'),
      JSON.parse('{"a": 5, "b": 6}')
    )
  })

  await t.test('parses null string', () => {
    assert.strictEqual(j.parse('null'), JSON.parse('null'))
  })

  await t.test('parses 0 string', () => {
    assert.strictEqual(j.parse('0'), JSON.parse('0'))
  })

  await t.test('parses string string', () => {
    assert.strictEqual(j.parse('"X"'), JSON.parse('"X"'))
  })

  await t.test('parses buffer', () => {
    assert.strictEqual(
      j.parse(Buffer.from('"X"')),
      JSON.parse(Buffer.from('"X"'))
    )
  })

  await t.test('parses object string (reviver)', () => {
    const reviver = (_key, value) => {
      return typeof value === 'number' ? value + 1 : value
    }

    assert.deepEqual(
      j.parse('{"a": 5, "b": 6}', reviver),
      JSON.parse('{"a": 5, "b": 6}', reviver)
    )
  })

  await t.test('protoAction', async (t) => {
    await t.test('sanitizes object string (reviver, options)', () => {
      const reviver = (_key, value) => {
        return typeof value === 'number' ? value + 1 : value
      }

      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', reviver, { protoAction: 'remove' }),
        { a: 6, b: 7 }
      )
    })

    await t.test('sanitizes object string (options)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', { protoAction: 'remove' }),
        { a: 5, b: 6 }
      )
    })

    await t.test('sanitizes object string (null, options)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', null, { protoAction: 'remove' }),
        { a: 5, b: 6 }
      )
    })

    await t.test('sanitizes object string (null, options)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"__proto__": { "x": 7 }}', { protoAction: 'remove' }),
        { a: 5, b: 6 }
      )
    })

    await t.test('sanitizes nested object string', () => {
      assert.deepEqual(
        j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }', { protoAction: 'remove' }),
        { a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } }
      )
    })

    await t.test('ignores proto property', () => {
      assert.deepEqual(
        j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'ignore' }),
        JSON.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')
      )
    })

    await t.test('ignores proto value', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": "__proto__"}'),
        { a: 5, b: '__proto__' }
      )
    })

    await t.test('errors on proto property', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__" : { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__" \n\r\t : { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__" \n \r \t : { "x": 7 } }'), SyntaxError)
    })

    await t.test('errors on proto property (null, null)', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', null, null), SyntaxError)
    })

    await t.test('errors on proto property (explicit options)', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }', { protoAction: 'error' }), SyntaxError)
    })

    await t.test('errors on proto property (unicode)', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005f_proto__": { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "_\\u005fp\\u0072oto__": { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005f\\u005f\\u0070\\u0072\\u006f\\u0074\\u006f\\u005f\\u005f": { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005F_proto__": { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "_\\u005Fp\\u0072oto__": { "x": 7 } }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u005F\\u005F\\u0070\\u0072\\u006F\\u0074\\u006F\\u005F\\u005F": { "x": 7 } }'), SyntaxError)
    })

    await t.test('should reset stackTraceLimit', () => {
      const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
      Error.stackTraceLimit = 42
      assert.throws(() => j.parse(text))
      assert.strictEqual(Error.stackTraceLimit, 42)
    })
  })

  await t.test('constructorAction', async (t) => {
    await t.test('sanitizes object string (reviver, options)', () => {
      const reviver = (_key, value) => {
        return typeof value === 'number' ? value + 1 : value
      }

      assert.deepEqual(
        j.parse('{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }', reviver, { constructorAction: 'remove' }),
        { a: 6, b: 7 }
      )
    })

    await t.test('sanitizes object string (options)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }', { constructorAction: 'remove' }),
        { a: 5, b: 6 }
      )
    })

    await t.test('sanitizes object string (null, options)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"constructor":{"prototype":{"bar":"baz"}} }', null, { constructorAction: 'remove' }),
        { a: 5, b: 6 }
      )
    })

    await t.test('sanitizes object string (null, options)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"constructor":{"prototype":{"bar":"baz"}} }', { constructorAction: 'remove' }),
        { a: 5, b: 6 }
      )
    })

    await t.test('sanitizes object string (no prototype key)', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": 6,"constructor":{"bar":"baz"} }', { constructorAction: 'remove' }),
        { a: 5, b: 6, constructor: { bar: 'baz' } }
      )
    })

    await t.test('sanitizes nested object string', () => {
      assert.deepEqual(
        j.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "c": { "d": 0, "e": "text", "constructor":{"prototype":{"bar":"baz"}}, "f": { "g": 2 } } }', { constructorAction: 'remove' }),
        { a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } }
      )
    })

    await t.test('ignores proto property', () => {
      assert.deepEqual(
        j.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }', { constructorAction: 'ignore' }),
        JSON.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }')
      )
    })

    await t.test('ignores proto value', () => {
      assert.deepEqual(
        j.parse('{"a": 5, "b": "constructor"}'),
        { a: 5, b: 'constructor' }
      )
    })

    await t.test('errors on proto property', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "constructor": {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "constructor" : {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "constructor" \n\r\t : {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "constructor" \n \r \t : {"prototype":{"bar":"baz"}} }'), SyntaxError)
    })

    await t.test("should not throw if the constructor key hasn't a child named prototype", () => {
      assert.doesNotThrow(() => j.parse('{ "a": 5, "b": 6, "constructor":{"bar":"baz"} }', null, null), SyntaxError)
    })

    await t.test('errors on proto property (null, null)', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }', null, null), SyntaxError)
    })

    await t.test('errors on proto property (explicit options)', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }', { constructorAction: 'error' }), SyntaxError)
    })

    await t.test('errors on proto property (unicode)', () => {
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u0063\\u006fnstructor": {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u0063\\u006f\\u006e\\u0073\\u0074ructor": {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u0063\\u006f\\u006e\\u0073\\u0074\\u0072\\u0075\\u0063\\u0074\\u006f\\u0072": {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u0063\\u006Fnstructor": {"prototype":{"bar":"baz"}} }'), SyntaxError)
      assert.throws(() => j.parse('{ "a": 5, "b": 6, "\\u0063\\u006F\\u006E\\u0073\\u0074\\u0072\\u0075\\u0063\\u0074\\u006F\\u0072": {"prototype":{"bar":"baz"}} }'), SyntaxError)
    })

    await t.test('handles constructor null safely', () => {
      assert.deepEqual(
        j.parse('{"constructor": null}', { constructorAction: 'remove' }),
        { constructor: null }
      )

      assert.deepEqual(
        j.parse('{"constructor": null}', { constructorAction: 'error' }),
        { constructor: null }
      )

      assert.deepEqual(
        j.parse('{"constructor": null}', { constructorAction: 'ignore' }),
        { constructor: null }
      )
    })
  })

  await t.test('protoAction and constructorAction', async (t) => {
    await t.test('protoAction=remove constructorAction=remove', () => {
      assert.deepEqual(
        j.parse(
          '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
          { protoAction: 'remove', constructorAction: 'remove' }
        ),
        { a: 5, b: 6 }
      )
    })

    await t.test('protoAction=ignore constructorAction=remove', () => {
      assert.deepEqual(
        j.parse(
          '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
          { protoAction: 'ignore', constructorAction: 'remove' }
        ),
        JSON.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')
      )
    })

    await t.test('protoAction=remove constructorAction=ignore', () => {
      assert.deepEqual(
        j.parse(
          '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
          { protoAction: 'remove', constructorAction: 'ignore' }
        ),
        JSON.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }')
      )
    })

    await t.test('protoAction=ignore constructorAction=ignore', () => {
      assert.deepEqual(
        j.parse(
          '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
          { protoAction: 'ignore', constructorAction: 'ignore' }
        ),
        JSON.parse('{ "a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }')
      )
    })

    await t.test('protoAction=error constructorAction=ignore', () => {
      assert.throws(() => j.parse(
        '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
        { protoAction: 'error', constructorAction: 'ignore' }
      ), SyntaxError)
    })

    await t.test('protoAction=ignore constructorAction=error', () => {
      assert.throws(() => j.parse(
        '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
        { protoAction: 'ignore', constructorAction: 'error' }
      ), SyntaxError)
    })

    await t.test('protoAction=error constructorAction=error', () => {
      assert.throws(() => j.parse(
        '{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}}, "__proto__": { "x": 7 } }',
        { protoAction: 'error', constructorAction: 'error' }
      ), SyntaxError)
    })
  })

  await t.test('sanitizes nested object string', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    const obj = j.parse(text, { protoAction: 'remove' })
    assert.deepEqual(obj, { a: 5, b: 6, c: { d: 0, e: 'text', f: { g: 2 } } })
  })

  await t.test('errors on constructor property', () => {
    const text = '{ "a": 5, "b": 6, "constructor": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.throws(() => j.parse(text), SyntaxError)
  })

  await t.test('errors on proto property', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.throws(() => j.parse(text), SyntaxError)
  })

  await t.test('errors on constructor property', () => {
    const text = '{ "a": 5, "b": 6, "constructor": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.throws(() => j.parse(text), SyntaxError)
  })

  await t.test('does not break when hasOwnProperty is overwritten', () => {
    const text = '{ "a": 5, "b": 6, "hasOwnProperty": "text", "__proto__": { "x": 7 } }'
    const obj = j.parse(text, { protoAction: 'remove' })
    assert.deepEqual(obj, { a: 5, b: 6, hasOwnProperty: 'text' })
  })
})

test('safeParse', async (t) => {
  await t.test('parses buffer', () => {
    assert.strictEqual(
      j.safeParse(Buffer.from('"X"')),
      JSON.parse(Buffer.from('"X"'))
    )
  })

  await t.test('should reset stackTraceLimit', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    Error.stackTraceLimit = 42
    assert.strictEqual(j.safeParse(text), null)
    assert.strictEqual(Error.stackTraceLimit, 42)
  })

  await t.test('sanitizes nested object string', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.strictEqual(j.safeParse(text), null)
  })

  await t.test('returns null on constructor property', () => {
    const text = '{ "a": 5, "b": 6, "constructor": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.strictEqual(j.safeParse(text), null)
  })

  await t.test('returns null on proto property', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.strictEqual(j.safeParse(text), null)
  })

  await t.test('returns null on constructor property', () => {
    const text = '{ "a": 5, "b": 6, "constructor": { "x": 7 }, "c": { "d": 0, "e": "text", "__proto__": { "y": 8 }, "f": { "g": 2 } } }'
    assert.strictEqual(j.safeParse(text), null)
  })

  await t.test('parses object string', () => {
    assert.deepEqual(j.safeParse('{"a": 5, "b": 6}'), { a: 5, b: 6 })
  })

  await t.test('returns null on proto object string', () => {
    assert.strictEqual(
      j.safeParse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'),
      null
    )
  })

  await t.test('returns undefined on invalid object string', () => {
    assert.strictEqual(j.safeParse('{"a": 5, "b": 6'), undefined)
  })

  await t.test('sanitizes object string (options)', () => {
    assert.strictEqual(
      j.safeParse('{"a": 5, "b": 6, "constructor":{"prototype":{"bar":"baz"}} }'),
      null
    )
  })

  await t.test('sanitizes object string (no prototype key)', () => {
    assert.deepEqual(
      j.safeParse('{"a": 5, "b": 6,"constructor":{"bar":"baz"} }'),
      { a: 5, b: 6, constructor: { bar: 'baz' } }
    )
  })
})

test('parse string with BOM', () => {
  const theJson = { hello: 'world' }
  const buffer = Buffer.concat([
    Buffer.from([239, 187, 191]), // the utf8 BOM
    Buffer.from(JSON.stringify(theJson))
  ])
  assert.deepEqual(j.parse(buffer.toString()), theJson)
})

test('parse buffer with BOM', () => {
  const theJson = { hello: 'world' }
  const buffer = Buffer.concat([
    Buffer.from([239, 187, 191]), // the utf8 BOM
    Buffer.from(JSON.stringify(theJson))
  ])
  assert.deepEqual(j.parse(buffer), theJson)
})

test('safeParse string with BOM', () => {
  const theJson = { hello: 'world' }
  const buffer = Buffer.concat([
    Buffer.from([239, 187, 191]), // the utf8 BOM
    Buffer.from(JSON.stringify(theJson))
  ])
  assert.deepEqual(j.safeParse(buffer.toString()), theJson)
})

test('safeParse buffer with BOM', () => {
  const theJson = { hello: 'world' }
  const buffer = Buffer.concat([
    Buffer.from([239, 187, 191]), // the utf8 BOM
    Buffer.from(JSON.stringify(theJson))
  ])
  assert.deepEqual(j.safeParse(buffer), theJson)
})

test('scan handles optional options', () => {
  assert.doesNotThrow(() => j.scan({ a: 'b' }))
})

test('safe option', async (t) => {
  await t.test('parse with safe=true returns null on __proto__', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'
    assert.strictEqual(j.parse(text, { safe: true }), null)
  })

  await t.test('parse with safe=true returns null on constructor', () => {
    const text = '{ "a": 5, "b": 6, "constructor": {"prototype": {"bar": "baz"}} }'
    assert.strictEqual(j.parse(text, { safe: true }), null)
  })

  await t.test('parse with safe=true returns object when valid', () => {
    const text = '{ "a": 5, "b": 6 }'
    assert.deepEqual(j.parse(text, { safe: true }), { a: 5, b: 6 })
  })

  await t.test('parse with safe=true and reviver', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'
    const reviver = (_key, value) => {
      return typeof value === 'number' ? value + 1 : value
    }
    assert.strictEqual(j.parse(text, reviver, { safe: true }), null)
  })

  await t.test('parse with safe=true and protoAction=remove returns null', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'
    assert.strictEqual(j.parse(text, { safe: true, protoAction: 'remove' }), null)
  })

  await t.test('parse with safe=true and constructorAction=remove returns null', () => {
    const text = '{ "a": 5, "b": 6, "constructor": {"prototype": {"bar": "baz"}} }'
    assert.strictEqual(j.parse(text, { safe: true, constructorAction: 'remove' }), null)
  })

  await t.test('parse with safe=false throws on __proto__', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'
    assert.throws(() => j.parse(text, { safe: false }), SyntaxError)
  })

  await t.test('parse with safe=false throws on constructor', () => {
    const text = '{ "a": 5, "b": 6, "constructor": {"prototype": {"bar": "baz"}} }'
    assert.throws(() => j.parse(text, { safe: false }), SyntaxError)
  })

  await t.test('scan with safe=true returns null on __proto__', () => {
    const obj = JSON.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')
    assert.strictEqual(j.scan(obj, { safe: true }), null)
  })

  await t.test('scan with safe=true returns null on constructor', () => {
    const obj = JSON.parse('{ "a": 5, "b": 6, "constructor": {"prototype": {"bar": "baz"}} }')
    assert.strictEqual(j.scan(obj, { safe: true }), null)
  })

  await t.test('scan with safe=true returns object when valid', () => {
    const obj = { a: 5, b: 6 }
    assert.deepEqual(j.scan(obj, { safe: true }), { a: 5, b: 6 })
  })

  await t.test('scan with safe=false throws on __proto__', () => {
    const obj = JSON.parse('{ "a": 5, "b": 6, "__proto__": { "x": 7 } }')
    assert.throws(() => j.scan(obj, { safe: false }), SyntaxError)
  })

  await t.test('scan with safe=false throws on constructor', () => {
    const obj = JSON.parse('{ "a": 5, "b": 6, "constructor": {"prototype": {"bar": "baz"}} }')
    assert.throws(() => j.scan(obj, { safe: false }), SyntaxError)
  })

  await t.test('parse with safe=true returns null on nested __proto__', () => {
    const text = '{ "a": 5, "c": { "d": 0, "__proto__": { "y": 8 } } }'
    assert.strictEqual(j.parse(text, { safe: true }), null)
  })

  await t.test('parse with safe=true returns null on nested constructor', () => {
    const text = '{ "a": 5, "c": { "d": 0, "constructor": {"prototype": {"bar": "baz"}} } }'
    assert.strictEqual(j.parse(text, { safe: true }), null)
  })

  await t.test('parse with safe=true and protoAction=ignore returns object', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'
    assert.deepEqual(
      j.parse(text, { safe: true, protoAction: 'ignore' }),
      JSON.parse(text)
    )
  })

  await t.test('parse with safe=true and constructorAction=ignore returns object', () => {
    const text = '{ "a": 5, "b": 6, "constructor": {"prototype": {"bar": "baz"}} }'
    assert.deepEqual(
      j.parse(text, { safe: true, constructorAction: 'ignore' }),
      JSON.parse(text)
    )
  })

  await t.test('should reset stackTraceLimit with safe option', () => {
    const text = '{ "a": 5, "b": 6, "__proto__": { "x": 7 } }'
    Error.stackTraceLimit = 42
    assert.strictEqual(j.parse(text, { safe: true }), null)
    assert.strictEqual(Error.stackTraceLimit, 42)
  })
})
