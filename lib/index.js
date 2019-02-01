'use strict';


const internals = {
    suspectRx: /"(?:_|\\u005f)(?:_|\\u005f)(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006f)(?:t|\\u0074)(?:o|\\u006f)(?:_|\\u005f)(?:_|\\u005f)"/
};


exports.parse = function (text, ...args) {

    // Normalize arguments

    const firstOptions = typeof args[0] === 'object' && args[0];
    const reviver = args.length > 1 || !firstOptions ? args[0] : undefined;
    const options = (args.length > 1 && args[1]) || firstOptions || {};

    // Parse normally, allowing exceptions

    const obj = JSON.parse(text, reviver);

    // options.protoAction: 'error' (default) / 'remove' / 'ignore'

    if (options.protoAction === 'ignore') {
        return obj;
    }

    // Ignore null and non-objects

    if (!obj ||
        typeof obj !== 'object') {

        return obj;
    }

    // Check original string for potential exploit

    if (!text.match(internals.suspectRx)) {
        return obj;
    }

    // Scan result for proto keys

    internals.scan(obj, options);

    return obj;
};


internals.scan = function (obj, options) {

    let next = [obj];

    while (next.length) {
        const nodes = next;
        next = [];

        for (const node of nodes) {
            if (node.hasOwnProperty('__proto__')) {
                if (options.protoAction !== 'remove') {
                    throw new SyntaxError('Object contains forbidden prototype property');
                }

                delete node.__proto__;
            }

            for (const key in node) {
                const value = node[key];
                if (value &&
                    typeof value === 'object') {

                    next.push(node[key]);
                }
            }
        }
    }
};
