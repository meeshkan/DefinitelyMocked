# DefinitelyMocked

## Publishing packages

Build CLI in `cli/dist/index.js`:

```bash
cd cli && yarn && yarn build && cd ..
```

Prepare service \<service-name\> for publishing:

```bash
node ./cli/dist/index.js prepare service-name
```

Publish the package from `./prepared/<service-name>`.
