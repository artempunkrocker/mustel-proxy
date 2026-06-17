# Mustel Proxy - Agent Instructions

## Project Overview

Minimal TypeScript library for type-safe proxy with dot-notation navigation.

## Structure

```text
src/
├── cache.ts                 # Cache module
├── index.ts                 # Main exports (types + proxy)
├── createProxyFactory.ts    # Core proxy implementation
├── types.ts                 # TypeScript types (DeepPath, LocaleProxy)

```

## Core Implementation

Proxy pattern using Map for caching and Symbol.toPrimitive for string conversion.

## Architecture Decisions

- **Proxy Pattern**: Core implementation using ES6 Proxy for dynamic property access
- **Map for Caching**: Uses Map for memory-efficient cache (no memory leaks)
- **Cache Injection Pattern**: Cache is injected as dependency, enabling custom implementations
- **Symbol-based Internal State**: Uses `Symbol.toPrimitive` for string conversion, `Symbol` keys for internal properties
- **Type-First Approach**: Full TypeScript type inference throughout, type-safe API

## Code Conventions

- **Strict Typing**: Use `unknown` instead of `any`, prefer explicit types over inference where needed
- **Immutability**: Use `as const` for literal types, prefer readonly properties where appropriate
- **Interface over Type**: Prefer interfaces for public API types, use type aliases for utility types
- **Consistent Naming**: CamelCase for functions/variables, PascalCase for types/interfaces, UPPER_CASE for constants
- **JSDoc**: Document complex functions and type parameters with JSDoc comments

## Development Workflow

1. Write types first, implementation second
2. Test thoroughly with 90%+ coverage
3. Use TDD
4. Run linting and type checking
5. Build and verify output
6. Always updated documentation
7. Always update AGENTS.md

## CRITICAL: Configuration Files Policy

**NEVER modify configuration files, disable ESLint rules, or bypass TypeScript strictness without explicit user permission.**

### What This Means

- **ESLint**: Do not add `// eslint-disable-*` comments, do not modify `eslint.config.js`
- **TypeScript**: Do not use `@ts-ignore`, `@ts-expect-error`, `as any`, or `as unknown` without explicit user request
- **Config Files**: Do not modify tsconfig, eslint.config, prettier.config, vite.config, vitest.config, etc.
- **Git Hooks**: Do not modify `.husky/*` hooks
- **Lint Rules**: Do not override or disable any linting rules

### If You Encounter Type/Lint Errors

1. Fix the actual issue (proper typing, code structure)
2. Report the error to the user with context
3. Ask for permission before modifying any configuration

### Exception

Only if the user **explicitly states** something like:

- "Disable this rule globally"
- "Add @ts-ignore here"
- "Configure ESLint to allow X"

Then you may proceed with the specific configuration change requested.

## Project Constraints

- No external runtime dependencies
- ESM-only source with dual build output (ESM + CJS)
- Zero-config API for simple use cases, optional cache injection
- TypeScript version: 6.0.3+
- Node.js version: 18+ (implied by dependencies)
