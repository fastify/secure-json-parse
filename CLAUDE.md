# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **secure-json-parse**, a drop-in replacement for `JSON.parse()` that protects against prototype poisoning attacks. The library detects and handles dangerous `__proto__` and `constructor` properties in JSON that could lead to prototype pollution vulnerabilities.

## Architecture

- **Single-file module**: `index.js` contains the core functionality
- **Three main functions**:
  - `parse()`: Main JSON parsing with security checks (supports reviver and options)
  - `scan()` (exported as `filter`): Scans existing objects for dangerous properties  
  - `safeParse()`: Returns undefined instead of throwing errors
- **Security approach**: Uses regex pre-scanning for performance, then deep object traversal for thorough cleanup
- **Enhanced security**: Now specifically targets `constructor.prototype` patterns rather than any `constructor` property
- **Action modes**: `error` (default), `remove`, or `ignore` for both `protoAction` and `constructorAction`
- **TypeScript support**: Includes TypeScript definitions in `types/` directory

## Commands

### Testing
```bash
npm test                # Run linting, unit tests, and TypeScript tests
npm run test:unit       # Run unit tests only (tape)
npm run test:typescript # Run TypeScript definition tests (tsd)
npm run test:browser    # Run tests in browsers using airtap
```

### Linting
```bash
npm run lint            # Run ESLint with neostandard config
npm run lint:fix        # Auto-fix linting issues where possible
```

### Benchmarking
```bash
npm run benchmark       # Run performance benchmarks against standard JSON.parse
```

### Code Standards
- Uses **neostandard** with **ESLint 9** for linting
- **Tape** for testing framework
- **nyc** for test coverage
- **tsd** for TypeScript definition testing
- Test files located in `test/` directory (not root)

### Git Workflow
- Use `git commit -s` to add Developer Certificate of Origin signoff
- Create feature branches for changes
- All commits should include proper signoff for contribution tracking

## Testing Notes

- Tests cover all action combinations (`error`/`remove`/`ignore`)
- Unicode escape sequence handling is thoroughly tested  
- Buffer and BOM (Byte Order Mark) support included
- Tests verify behavior with overwritten `hasOwnProperty`
- Constructor null handling is tested to prevent TypeError
- Enhanced security tests for `constructor.prototype` patterns specifically
- TypeScript definitions are validated with test files in `types/`