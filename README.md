# D.A.I.S.Y. Monorepo

This monorepo contains the following packages:

- `@answerai/daisy-core`: Core functionality for the D.A.I.S.Y. tool.
- `@answerai/daisy`: Main package for the D.A.I.S.Y. tool.
- `@answerai/daisy-github-workflow`: GitHub workflow integration for D.A.I.S.Y.
- `tsconfig` - Contains the base tsconfigs used by the

## Build, Develop, and Deploy

To build the codebase, follow these steps:

1. Install the dependencies using `pnpm i`.
2. Build the packages using `pnpm build`.

To develop the codebase, use the following command:

- `pnpm dev`: Starts the development build and watches for changes.

To deploy the codebase, follow these steps:

1. Make the necessary changes to the code.
2. Run `pnpm changeset` to generate a changeset.
3. The changeset workflow will automatically trigger the deployment process, once the created PR is approved and merged.

## Dependencies and Tools

The codebase uses `pnpm` to manage dependencies and scripts. Make sure you have `pnpm` installed globally before proceeding.

## Testing and Linting

To run tests, use the following command:

- `pnpm test`: Runs the test suite.

Linting is automatically performed during the build process.
