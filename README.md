# Sensible Web3 Providers

[![npm version](https://img.shields.io/npm/v/@sensible-contract/providers.svg)](https://www.npmjs.com/package/@sensible-contract/providers)

This is part of [sensible-web3][repo].

It contains common Provider classes to support sensible-web3.

Please read the [documentation][docs] for more.

## Installation

```bash
npm install @sensible-contract/providers
```

## Usage

```js
const {
  SensiblequeryProvider,
  MetaSVProvider,
  WhatsOnChainProvider
} = require("@sensible-contract/providers");
let provider = new SensiblequeryProvider();
```

[docs]: https://sensible-web3.readthedocs.io/en/latest/web3.html#providers
[repo]: https://github.com/sensible-contract/sensible-web3
