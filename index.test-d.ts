import { expectType, expectError } from 'tsd'
import sjson from "."

expectError(sjson.parse(null))
expectType<any>(sjson.parse('{"anything":0}'))
sjson.parse('"test"', { constructorAction: 'error' })
sjson.parse('"test"', null, { constructorAction: 'error' })

sjson.parse('"test"', null, { protoAction: 'remove' })
expectError(sjson.parse('"test"', null, { protoAction: 'incorrect' }))
sjson.parse('"test"', null, { constructorAction: 'ignore' })
expectError(sjson.parse('"test"', null, { constructorAction: 'incorrect' }))

sjson.safeParse('"test"', null)
sjson.safeParse('"test"')
expectError(sjson.safeParse(null))

declare const input: Buffer
sjson.parse(input)
sjson.safeParse(input)

sjson.parse('{"anything":0}', (key, value) => {
  expectType<string>(key)
})
sjson.safeParse('{"anything":0}', (key, value) => {
  expectType<string>(key)
})
