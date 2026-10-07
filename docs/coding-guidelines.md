# Coding Guidelines

These guidelines apply to contributions across the TODO app's JavaScript monorepo: a React frontend and Node.js/Express backend managed with npm workspaces. They complement the [functional requirements](functional-requirements.md), [UI guidelines](ui-guidelines.md), and [testing guidelines](testing-guidelines.md).

## 1. Overview and Engineering Principles

- **Readability:** Write code for the next contributor who must understand, debug, or change it. Prefer clear control flow and descriptive names over clever shorthand.
- **Maintainability:** Keep modules cohesive, dependencies explicit, and behavior covered by tests. Make changes easy to review and extend.
- **Simplicity:** Choose the smallest solution that fully meets the requirement. Avoid speculative abstractions and unnecessary dependencies.
- **Consistency:** Follow the patterns and conventions already used in the package you are changing. Apply shared conventions consistently across frontend and backend.
- **Performance awareness:** Prefer straightforward implementations, then measure before optimizing. Avoid unnecessary work in render paths and repeated database or network operations; do not trade clarity for unmeasured gains.

## 2. General Coding Standards

- Use descriptive `camelCase` names for JavaScript variables and functions, `PascalCase` for React components and classes, and `UPPER_SNAKE_CASE` for true module-level constants. Name files to reflect their primary component or responsibility.
- Give each function or method one clear purpose. Keep functions focused, use explicit inputs and outputs, and extract a helper when it clarifies meaningful repeated logic.
- Organize files by package and responsibility: frontend code under `packages/frontend/src/`, backend application code under `packages/backend/src/`, and tests in the locations defined by the [testing guidelines](testing-guidelines.md). Keep shared code in an explicit shared module rather than importing across package internals.
- Avoid magic numbers and hardcoded environment-specific values. Give domain values meaningful names and put configurable values in one appropriate configuration location. Read secrets and deployment settings from environment variables, with safe defaults only for non-sensitive settings.
- Prefer composition and reuse over duplicated behavior. Do not introduce generic abstractions for one-off code unless they make the current behavior materially clearer.

## 3. Formatting Standards

- Use two spaces for JavaScript indentation; do not mix tabs and spaces. Keep spacing consistent around operators, commas, and control-flow keywords.
- Aim for a maximum line length of 100 characters. Break long expressions, argument lists, and chained calls at logical boundaries without obscuring their structure.
- Put opening braces on the same line as declarations and control statements. Keep closing braces aligned with the statement that opened the block. Use trailing commas in multiline objects, arrays, and argument lists where supported by the project's JavaScript tooling.
- Use one automated formatter consistently. Prettier is the recommended formatter if the project adopts one; do not introduce competing formatters or reformat unrelated files. Until a formatter is configured, follow the conventions in the surrounding code.
- Keep JSX readable: use one prop per line for long elements and extract complex conditional rendering into named variables or components when that improves clarity.

## 4. Import Organization

Group imports in this order, with a blank line between groups:

1. Node.js built-ins and other standard-library modules.
2. Third-party dependencies.
3. Internal project modules.

- Sort imports alphabetically within each group where practical.
- Prefer explicit imports and stable module paths. Avoid deep imports into another package's private implementation.
- Remove unused imports. Do not retain commented-out imports or code as a substitute for version control.

```js
import path from 'node:path';

import express from 'express';

import { createTask } from './tasks.js';
```

## 5. Linting and Static Analysis

- The frontend currently uses the Create React App ESLint presets `react-app` and `react-app/jest`. Preserve those checks and apply consistent lint rules to backend code as the backend lint configuration is established.
- Use a single agreed ESLint configuration for each package or a shared root configuration. Run lint and static checks in CI as well as locally; new and changed code must introduce no lint warnings. Fix warnings rather than suppressing them.
- Allow a lint suppression only for a specific, understood false positive or necessary exception. Keep it on the narrowest line or block, include a short reason, and never disable a rule broadly to make checks pass.
- The project is JavaScript-first. Use JSDoc for important non-obvious interfaces and data shapes. If TypeScript is introduced, enable strict checking and avoid `any` unless there is a documented reason. Do not mix type systems within a package without an agreed migration plan.

## 6. Clean Code Best Practices

- Apply **DRY** when shared behavior is genuinely repeated; keep distinct behavior separate even if it looks superficially similar.
- Apply **KISS**: favor the simplest design that communicates intent and handles expected cases.
- Use **SOLID** as a set of design heuristics, not as a reason to add layers: keep responsibilities focused, depend on clear interfaces, and extend behavior without unnecessary changes to unrelated code.
- Maintain **separation of concerns** between UI rendering, application behavior, persistence, and HTTP transport. Keep components and modules focused on their role.
- Follow the **single responsibility principle**: a function, component, or module should have one coherent reason to change.

## 7. Error Handling

- Handle errors at a boundary that can respond appropriately. Preserve useful context when propagating an error; do not catch an error only to ignore it.
- Return consistent API error shapes and appropriate HTTP status codes. Present users with concise, actionable messages; keep stack traces, implementation details, and internal diagnostics out of client responses.
- Log unexpected server failures with enough context to diagnose them, while excluding passwords, tokens, personal data, and other secrets. Use the project's logging approach consistently and avoid duplicate logs at every layer.
- Make expected failure states visible in the UI, including validation failures and failed requests. Never silently discard an operation or leave the interface suggesting it succeeded when it did not.
