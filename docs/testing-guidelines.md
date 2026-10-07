# Testing Guidelines

These guidelines define how tests should be organized and maintained across the TODO app.

## Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Name unit test files `*.test.js` or `*.test.ts`.
- Place backend unit tests in `packages/backend/__tests__/`.
- Place frontend unit tests in `packages/frontend/src/__tests__/`.
- Name each file after the code it tests, such as `app.test.js` for `app.js`.

## Integration Tests

- Use Jest and Supertest to test backend API endpoints with real HTTP requests.
- Place integration tests in `packages/backend/__tests__/integration/`.
- Name integration test files `*.test.js` or `*.test.ts`.
- Choose descriptive names for the endpoint or behavior under test, such as `todos-api.test.js` for TODO API endpoints.

## End-to-End Tests

- Use Playwright as the required framework for browser-automated tests of complete UI workflows.
- Place E2E tests in `tests/e2e/` and name them `*.spec.js` or `*.spec.ts`.
- Name files after the user journey they cover, such as `todo-workflow.spec.js`.
- Use the Page Object Model (POM) pattern to keep browser interactions maintainable.
- Use one browser only.
- Limit E2E coverage to 5-8 critical user journeys. Prioritize happy paths and key edge cases over exhaustive coverage.

## Test Reliability and Coverage

- Keep every test isolated and independent. Each test must set up its own data and must not rely on another test's execution or state.
- Use setup and teardown hooks as required to prepare and clean up test state. Tests must succeed across multiple runs.
- Include appropriate tests with every new feature.
- Keep tests maintainable: use clear names, focused assertions, and shared helpers or fixtures where they reduce duplication without hiding behavior.

## Port Configuration

- Configure application ports with the `PORT` environment variable and provide sensible defaults.
- The backend default is `3030`, using `const PORT = process.env.PORT || 3030;`.
- The frontend uses React's default port `3000`; allow it to be overridden with `PORT`.
- Environment-based port configuration allows CI/CD workflows to assign or detect ports dynamically.
