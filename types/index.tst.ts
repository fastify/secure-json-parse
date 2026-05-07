import { expect } from 'tstyche'
import sjson from '..'

expect(sjson.parse).type.not.toBeCallableWith(null)
expect(sjson.parse('{"anything":0}')).type.toBe<any>()

sjson.parse('"test"', null, { protoAction: 'remove' })
expect(sjson.parse).type.not.toBeCallableWith('"test"', null, { protoAction: 'incorrect' })
sjson.parse('"test"', null, { constructorAction: 'ignore' })
expect(sjson.parse).type.not.toBeCallableWith('"test"', null, { constructorAction: 'incorrect' })
expect(sjson.parse).type.not.toBeCallableWith('"test"', { constructorAction: 'incorrect' })
sjson.parse('test', { constructorAction: 'remove' })
sjson.parse('test', { protoAction: 'ignore' })
sjson.parse('test', () => {}, { protoAction: 'ignore', constructorAction: 'remove' })
sjson.parse('"test"', null, { safe: true })
sjson.parse('"test"', { safe: true })
sjson.parse('test', () => {}, { safe: false })
sjson.parse('test', { protoAction: 'remove', safe: true })
expect(sjson.parse).type.not.toBeCallableWith('"test"', null, { safe: 'incorrect' })

sjson.safeParse('"test"', null)
sjson.safeParse('"test"')
expect(sjson.safeParse).type.not.toBeCallableWith(null)

sjson.scan({}, { protoAction: 'remove' })
sjson.scan({}, { protoAction: 'ignore' })
sjson.scan({}, { constructorAction: 'error' })
sjson.scan({}, { constructorAction: 'ignore' })
sjson.scan([], {})
sjson.scan({}, { safe: true })
sjson.scan({}, { protoAction: 'remove', safe: false })
expect(sjson.scan).type.not.toBeCallableWith({}, { safe: 'incorrect' })

declare const input: Buffer
sjson.parse(input)
sjson.safeParse(input)

sjson.parse('{"anything":0}', (key, _value) => {
  expect(key).type.toBe<string>()
})
sjson.safeParse('{"anything":0}', (key, _value) => {
  expect(key).type.toBe<string>()
})
