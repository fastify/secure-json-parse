import { expect } from 'tstyche'
import sjson from '..'

// expectError(sjson.parse(null)) - tstyche: TypeScript would error on this
expect(sjson.parse('{"anything":0}')).type.toBe<any>()

sjson.parse('"test"', null, { protoAction: 'remove' })
// expectError(sjson.parse('"test"', null, { protoAction: 'incorrect' })) - TypeScript would error
sjson.parse('"test"', null, { constructorAction: 'ignore' })
// expectError(sjson.parse('"test"', null, { constructorAction: 'incorrect' })) - TypeScript would error
// expectError(sjson.parse('"test"', { constructorAction: 'incorrect' })) - TypeScript would error
sjson.parse('test', { constructorAction: 'remove' })
sjson.parse('test', { protoAction: 'ignore' })
sjson.parse('test', () => {}, { protoAction: 'ignore', constructorAction: 'remove' })
sjson.parse('"test"', null, { safe: true })
sjson.parse('"test"', { safe: true })
sjson.parse('test', () => {}, { safe: false })
sjson.parse('test', { protoAction: 'remove', safe: true })
// expectError(sjson.parse('"test"', null, { safe: 'incorrect' })) - TypeScript would error

sjson.safeParse('"test"', null)
sjson.safeParse('"test"')
// expectError(sjson.safeParse(null)) - TypeScript would error

sjson.scan({}, { protoAction: 'remove' })
sjson.scan({}, { protoAction: 'ignore' })
sjson.scan({}, { constructorAction: 'error' })
sjson.scan({}, { constructorAction: 'ignore' })
sjson.scan([], {})
sjson.scan({}, { safe: true })
sjson.scan({}, { protoAction: 'remove', safe: false })
// expectError(sjson.scan({}, { safe: 'incorrect' })) - TypeScript would error

declare const input: Buffer
sjson.parse(input)
sjson.safeParse(input)

sjson.parse('{"anything":0}', (key, _value) => {
  expect(key).type.toBe<string>()
})
sjson.safeParse('{"anything":0}', (key, _value) => {
  expect(key).type.toBe<string>()
})