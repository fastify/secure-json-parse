'use strict'

const { test } = require('playwright/test')
const fs = require('node:fs')
const path = require('node:path')

test('should run safely in the browser without Buffer crashing', async ({ page }) => {
  const libCode = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8')

  await page.evaluate((src) => {
    const module = { exports: {} }
    // eslint-disable-next-line no-new-func
    new Function('module', 'exports', src)(module, module.exports)
    const parse = module.exports

    if (typeof Buffer !== 'undefined') {
      throw new Error('Buffer is leaking inside the browser environment!')
    }

    // eslint-disable-next-line no-proto
    const res = parse('{"a":1,"__proto__":{"b":2}}', null, { protoAction: 'remove' })

    // eslint-disable-next-line no-proto
    if (res.a !== 1 || (res.__proto__ && res.__proto__.b === 2)) {
      throw new Error('Prototype pollution protection logic is broken client-side!')
    }
  }, libCode)
})
