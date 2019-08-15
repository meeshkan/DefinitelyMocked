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
yarn cli prepare [service-name] [-o output-directory]
```

## Publishing a prepared package

```bash
# Move to where you prepared the package
cd prepared/[service-name]

# Verify package.json is correct
cat package.json

# Publish dry-run
npm publish --access public --dry-run
```
