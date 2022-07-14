'use strict'

const hasBuffer = typeof Buffer !== 'undefined'
const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/

function parse (text, reviver, options) {
  // Normalize arguments
  if (
    options == null &&
    reviver !== null &&
    typeof reviver === 'object'
  ) {
    options = reviver
    reviver = undefined
  }

  const protoAction = (options && options.protoAction) || 'error'
  const constructorAction = (options && options.constructorAction) || 'error'

  if (hasBuffer && Buffer.isBuffer(text)) {
    text = text.toString()
  }

  // BOM checker
  if (text && text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1)
  }

  // Parse normally, allowing exceptions
  const obj = JSON.parse(text, reviver)

  // options: 'error' (default) / 'remove' / 'ignore'
  if (protoAction === 'ignore' && constructorAction === 'ignore') {
    return obj
  }

  // Ignore null and non-objects
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (protoAction !== 'ignore' && constructorAction !== 'ignore') {
    if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
      return obj
    }
  } else if (protoAction !== 'ignore' && constructorAction === 'ignore') {
    if (suspectProtoRx.test(text) === false) {
      return obj
    }
  } else {
    if (suspectConstructorRx.test(text) === false) {
      return obj
    }
  }

  let next = [obj]
  let i = 0
  let il = 1
  let node

  while (il = next.length) { // eslint-disable-line no-cond-assign
    const nodes = next
    next = []

    for (i = 0; i < il; ++i) {
      node = nodes[i]
      if (protoAction !== 'ignore' && Object.prototype.hasOwnProperty.call(node, '__proto__')) { // Avoid calling node.hasOwnProperty directly
        if (protoAction === 'error') {
          throw new SyntaxError('Object contains forbidden prototype property')
        }

        delete node.__proto__ // eslint-disable-line no-proto
      }

      if (constructorAction !== 'ignore' &&
          Object.prototype.hasOwnProperty.call(node, 'constructor') &&
          Object.prototype.hasOwnProperty.call(node.constructor, 'prototype')) { // Avoid calling node.hasOwnProperty directly
        if (constructorAction === 'error') {
          throw new SyntaxError('Object contains forbidden prototype property')
        }

        delete node.constructor
      }

      for (const key in node) {
        const value = node[key]
        if (value && typeof value === 'object') {
          next.push(node[key])
        }
      }
    }
  }
  return obj
}

function safeParse (text, reviver) {
  if (hasBuffer && Buffer.isBuffer(text)) {
    text = text.toString()
  }

  // BOM checker
  if (text && text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1)
  }

  let obj = null
  try {
    obj = JSON.parse(text, reviver)
  } catch (err) {
    return null
  }

  // Ignore null and non-objects
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
    return obj
  }

  let next = [obj]
  let i = 0
  let il = 1
  let node
  while (il = next.length) { // eslint-disable-line no-cond-assign
    const nodes = next
    next = []

    for (i = 0; i < il; ++i) {
      node = nodes[i]
      if (Object.prototype.hasOwnProperty.call(node, '__proto__')) { // Avoid calling node.hasOwnProperty directly
        return null
      }

      if (Object.prototype.hasOwnProperty.call(node, 'constructor') &&
            Object.prototype.hasOwnProperty.call(node.constructor, 'prototype')) { // Avoid calling node.hasOwnProperty directly
        return null
      }

      for (const key in node) {
        const value = node[key]
        if (value && typeof value === 'object') {
          next.push(node[key])
        }
      }
    }
  }
  return obj
}

module.exports = {
  parse,
  safeParse
}
