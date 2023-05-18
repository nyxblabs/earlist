
[![cover][cover-src]][cover-href]
[![npm version][npm-version-src]][npm-version-href] 
[![npm downloads][npm-downloads-src]][npm-downloads-href] 
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

# 👂 earlist

> 👂 An elegant HTTP listener.


## ✨ Features 

- Promisified interface for listening and closing server ✨
- Work with express/connect or plain http handle function 🔄
- Support HTTP and HTTPS 🔒
- Assign a port or fallback to human friendly alternative (with [scotty-beam-me-up](https://github.com/nyxblabs/scotty-beam-me-up)) 🌐
- Generate listening URL and show on console 📡
- Copy URL to clipboard (dev only by default) 📋
- Open URL in browser (opt-in) 🌐🔍
- Generate self-signed certificate 📜
- Detect test and production environments 🧪🚀
- Close on exit signal ⛔
- Gracefully shutdown server with [http-shutdown](https://github.com/thedillonb/http-shutdown) 🛠️

## ⚡️ Install

Install:

```bash
#nyxi
nyxi earlist

#pnpm
pnpm add earlist

#npm
npm i earlist

#yarn
yarn add earlist
```

Import into your Node.js project:

```ts
// CommonJS
const { listen } = require('earlist')

// ESM
import { listen } from 'earlist'
```

## 🎯 Usage

**Function signature:**

```ts
const { url, getURL, server, close } = await listen(handle, options?)
```

**Plain handle function:**

```ts
listen((_req, res) => {
   res.end('hi')
})
```

**With express/connect:**

```ts
const express = require('express')
const app = express()

app.use('/', ((_req, res) => {
  res.end('hi')
})

listen(app)
```

## ⚙️ Options

### ⚓️ `port`

- Default: `process.env.PORT` or 3000 or memorized random (see [scotty-beam-me-up](https://github.com/nyxblabs/scotty-beam-me-up))

Port to listen.

### 🏠 `hostname`

- Default: `process.env.HOST || '0.0.0.0'`

Default hostname to listen.

### 🔒 `https`

- Type: Boolean | Object
- Default: `false`

Listen on https with SSL enabled.

#### 📜 Self Signed Certificate

By setting `https: true`, earlist will use an auto generated self-signed certificate.

You can set https to an object for custom options. Possible options:

- `domains`: (Array) Default is `['localhost', '127.0.0.1', '::1']`.
- `validityDays`: (Number) Default is `1`.

#### 📄 User Provided Certificate

Set `https: { cert, key }` where cert and key are path to the ssl certificates.

You can also provide inline cert and key instead of reading from filesystem. In this case, they should start with `--`.

### 🌐 `showURL`

- Default: `true` (force disabled on test environment)

Show a CLI message for listening URL.

### 🌐 `baseURL`

- Default: `/`

### 🔍 `open`

- Default: `false` (force disabled on test and production environments)

Open URL in browser. Silently ignores errors.

### 📋 `clipboard`

- Default: `false` (force disabled on test and production environments)

Copy URL to clipboard. Silently ignores errors.

### 🧪 `isTest`

- Default: `process.env.NODE_ENV === 'test'`

Detect if running in a test environment to disable some features.

### ⛔️ `autoClose`

- Default: `true`

Automatically close when an exit signal is received on process.

### 📜 License

[MIT](./LICENSE) - Made with 💞

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/earlist?style=flat&colorA=18181B&colorB=14F195
[npm-version-href]: https://npmjs.com/package/earlist
[npm-downloads-src]: https://img.shields.io/npm/dm/earlist?style=flat&colorA=18181B&colorB=14F195
[npm-downloads-href]: https://npmjs.com/package/earlist
[bundle-src]: https://img.shields.io/bundlephobia/minzip/earlist?style=flat&colorA=18181B&colorB=14F195
[bundle-href]: https://bundlephobia.com/result?p=earlist
[license-src]: https://img.shields.io/github/license/nyxblabs/earlist.svg?style=flat&colorA=18181B&colorB=14F195
[license-href]: https://github.com/nyxblabs/earlist/blob/main/LICENSE

<!-- Cover -->
[cover-src]: https://raw.githubusercontent.com/nyxblabs/earlist/main/.github/assets/cover-github-earlist.png
[cover-href]: https://💻nyxb.ws
[license-href]: https://github.com/unjs/earlist/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&colorA=18181B&colorB=14F195
[jsdocs-href]: https://www.jsdocs.io/package/earlist
