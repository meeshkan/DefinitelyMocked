# DefinitelyMocked

This repository contains [service descriptions](https://www.unmock.io/docs/openapi) for [Unmock](https://www.unmock.io/). Installing a service description from this repository is the quickest way to get started with mocking APIs in your tests!

## Installing services

Browse for services in [services](./services) folder. Every subfolder in `services` is a service description containing, for example, an OpenAPI specification for the service. For an example, see the service description for [Github REST API v3](https://developer.github.com/v3/) in [./services/githubv3](./services/githubv3).

Once you've found a service you need for your tests, install it from [npm](https://www.npmjs.com/). Service descriptions are publishes under the [@unmock](https://www.npmjs.com/org/unmock) organization.

For example, to install the GitHub service description from [./services/githubv3](./services/githubv3), install package `@unmock/githubv3`:

```bash
npm i @unmock/githubv3 --save-dev
# or
yarn add -D @unmock/githubv3
```

`unmock-js` will then automatically include the service description in your tests from `node_modules/@unmock`.

For an example of how to use service descriptions for mocking APIs in tests, see the [example project](https://github.com/unmock/unmock-examples/tree/master/using-service-repository) in [unmock-examples](https://github.com/unmock/unmock-examples).

## Adding new services

To add a new service, add a new folder in [./services](./services) folder. Make a pull request and we'll publish it under `@unmock` organization in `npm` so anyone can install it in their project.

## Development

### Publishing packages

Build CLI in `cli/dist/index.js`:

```bash
cd cli && yarn && yarn build && cd ..
```

Prepare service \<service-name\> for publishing:

```bash
node ./cli/dist/index.js prepare service-name
```

Publish the package from `./prepared/<service-name>`.
