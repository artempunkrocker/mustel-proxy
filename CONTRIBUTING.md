# Contributing to Mustel Proxy

Thank you for your interest in contributing to Mustel Proxy! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/artempunkrocker/mustel-proxy.git
cd mustel-proxy

# Install dependencies
npm install

# Setup git hooks
npm run prepare
```

## Development Workflow

### Making Changes

1. **Create a new branch:**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes following the code conventions in AGENTS.md**

3. **Test your changes:**

   ```bash
   # Run tests
   npm test

   # Run type checking
   npm run type-check

   # Run linter
   npm run lint

   # Format code (optional - run if you modified formatting)
   npm run format
   ```

4. **Build the project:**

   ```bash
   npm run build
   ```

### Committing Changes

Use our configured commit process for consistent commit messages:

```bash
# Interactive commit wizard (recommended)
npm run commit
```

This will guide you through creating a conventional commit message following our commitlint rules.

**Commit Message Format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `chore:` - Other changes

### Pull Request Process

1. **Push your branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request on GitHub** with:
   - Clear title following conventional commits
   - Detailed description of changes
   - Screenshots/UI changes if applicable
   - Related issues (using `Fixes #xxx` or `Closes #xxx`)

3. **Ensure CI checks pass** before requesting review

## Code Conventions

### TypeScript

- Use strict typing - prefer explicit types over inference where needed
- Use `unknown` instead of `any`
- Document complex functions and type parameters with JSDoc comments
- Follow the architecture decisions outlined in AGENTS.md

### Testing

- Write tests for all new functionality
- Maintain 90%+ code coverage (lines, functions, branches, statements)
- Use Vitest for testing
- Test success cases and error handling

### Code Style

- Follow existing patterns in the codebase
- Use camelCase for functions/variables
- Use PascalCase for types/interfaces
- Use UPPER_CASE for constants
- Run `npm run format` before committing for consistent formatting

## Configuration Files Policy

**CRITICAL:** Never modify configuration files, disable ESLint rules, or bypass TypeScript strictness without explicit permission.

- **ESLint:** Do not add `// eslint-disable-*` comments, do not modify `eslint.config.js`
- **TypeScript:** Do not use `@ts-ignore`, `@ts-expect-error`, `as any`, or `as unknown`
- **Config Files:** Do not modify tsconfig, eslint.config, prettier.config, vite.config, vitest.config, etc.
- **Git Hooks:** Do not modify `.husky/*` hooks

If you encounter type/lint errors, fix the actual issue rather than bypassing it.

## Release Process

Releases are automated via semantic-release. Do not manually update the version in package.json or CHANGELOG.md.

**Version bumps happen automatically based on commit messages:**

- `fix:` → patch release (0.1.0 → 0.1.1)
- `feat:` → minor release (0.1.0 → 0.2.0)
- `feat!` or `refactor!` (with !) → major release (0.1.0 → 1.0.0)

## Reporting Issues

When reporting bugs or suggesting features:

1. Search existing issues first
2. Use issue templates if available
3. Provide clear descriptions and reproduction steps
4. Include environment information (Node.js version, OS, etc.)

## Getting Help

- Check the [README.md](README.md) for usage examples
- Review [AGENTS.md](AGENTS.md) for implementation details
- Open an issue on GitHub for questions or bug reports

## License

By contributing to Mustel Proxy, you agree that your contributions will be licensed under the Apache License 2.0.
