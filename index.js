'use strict'

const suspectRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/

function parse (text, reviver, options) {
  // Normalize arguments
  if (options == null) {
    if (reviver != null && typeof reviver === 'object') {
      options = reviver
      reviver = undefined
    } else {
      options = {}
    }
  }

  // Parse normally, allowing exceptions
  const obj = JSON.parse(text, reviver)

  // options.protoAction: 'error' (default) / 'remove' / 'ignore'
  if (options.protoAction === 'ignore') {
    return obj
  }

  // Ignore null and non-objects
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // Check original string for potential exploit
  if (!text.match(suspectRx)) {
    return obj
  }

  // Scan result for proto keys
  scan(obj, options)

  return obj
}

function scan (obj, options) {
  options = options || {}

  var next = [obj]

  while (next.length) {
    const nodes = next
    next = []

    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, '__proto__')) { // Avoid calling node.hasOwnProperty directly
        if (options.protoAction !== 'remove') {
          throw new SyntaxError('Object contains forbidden prototype property')
        }

        delete node.__proto__ // eslint-disable-line
      }

      for (const key in node) {
        const value = node[key]
        if (value && typeof value === 'object') {
          next.push(node[key])
        }
      }
    }
  }
}

function safeParse (text, reviver) {
  try {
    return parse(text, reviver)
  } catch (ignoreError) {
    return null
  }
}

module.exports = {
  parse,
  scan,
  safeParse
}
