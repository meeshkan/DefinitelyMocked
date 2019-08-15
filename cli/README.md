# Service publishing CLI

### Usage

Install dependencies:

```bash
yarn
```

See the list of available commands:

```bash
yarn cli -h
```

## Preparing a package for publishing

Create a folder preparing package for publishing:

```bash
yarn cli prepare [service-name] [-o output-directory] [-d service-directory]
```

Service is searched from `./services` and package is prepared in `.prepared/` by default.

## Publishing a prepared package

```bash
# Move to where you prepared the package
cd prepared/[service-name]

# Check all files are present
ls

# Verify package.json is correct
cat package.json

# Publish (dry-run)
npm publish --access public --dry-run
```

## Development

Run tests:

```bash
yarn test
```

Build distribution:

```bash
yarn build
```

Run linting:

```bash
yarn lint
```

Check formatting:

```bash
yarn format-check
```

Fix formatting:

```bash
yarn format
```
