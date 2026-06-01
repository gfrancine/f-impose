# Developing

F-impose is built with [NodeJS](https://nodejs.org/en), [Vite](https://vite.dev/) as the build tool, [TypeScript](https://www.typescriptlang.org/), and [React](https://react.dev/) on the front-end.

- Vite requires a NodeJS version of 20.19 or higher. See the [Vite documentation](https://vite.dev/guide/) for more details.

## Roadmap

If you'd like to contribute to the source code and want to see what can be worked on, feel free to look at the development roadmap [here](https://github.com/users/gfrancine/projects/4/views/1).

## Commands

[npm](https://www.npmjs.com/) or any other npm-compatible package managers are required to run the development scripts.

### Getting Started/Setup

```sh
# Clone the Git repository
git clone https://github.com/gfrancine/f-impose/ # (or your own forked repo)
cd f-impose

# Install dependencies
npm i
```

### Development Scripts

```sh
# Open a live development preview in the browser
npm run dev

# Build the static HTML/JS/CSS files to the dist/ folder
npm run build

# Format the codebase; always run pre-commit
npm run fmt

# Lint the codebase
npm run lint

# Run tests
npm run test

# Deploy the site to GitHub Pages
# Merges the master branch to the `github-pages` branch
# and pushes it upstream to the `github` remote.
npm run deploy-gh
npm run deploy-gl # equivalent command for Gitlab Pages
```

## Architecture

Within `src/`:

- `main.ts` — The front-end entry point, ie. `index.js`.
- `components/` — React components, including the main App interface.
- `presets/` — Where all the layout preset definitions live. Aside from preset files, it contains:
  - `index.ts` — Presets exported here are how they're included in the app.
  - `helpers.ts` — Where abstractions for common/repeating functionality among presets go.
  - `boilerplate.ts` — A blank preset template that can be duplicated.

## Guides

- [Writing Presets](./Writing%20Presets.md)
