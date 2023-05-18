# Changelog


## v0.0.3

[compare changes](https://github.com/nyxblabs/earlist/compare/v0.0.2...v0.0.3)


### 🎨 Styles

  - **index.ts:** Refactor import statement for picocolors library The import statement for the picocolors library has been refactored to use a default import for the color object. This improves the readability of the code and reduces the number of named imports. ([a2781dd](https://github.com/nyxblabs/earlist/commit/a2781dd))

### ❤️  Contributors

- Nyxb <contact@nyxb.xyz>

## v0.0.2


### 🚀 Enhancements

  - **cert.ts:** Add functions to generate SSL certificates and Certificate Authorities This commit adds three functions to generate SSL certificates and Certificate Authorities. The `generateSSLCert` function generates an SSL certificate with the provided options, including the domains, validity days, and the Certificate Authority's key and certificate. The `generateCA` function generates a Certificate Authority with the provided options, including the common name, organization, country code, state, locality, and validity days. The `generateCert` function generates a certificate with the provided options, including the subject, issuer, extensions, validity days, and signing key. ([866d654](https://github.com/nyxblabs/earlist/commit/866d654))
  - **open:** Add open library for cross-platform opening of files and URLs This commit adds the `open` library to the project, which allows for cross-platform opening of files and URLs. The library supports macOS, Windows, and Linux, including WSL. It also supports opening of applications with arguments. ([ae2405b](https://github.com/nyxblabs/earlist/commit/ae2405b))
  - **index.ts:** Add listen function to start a server with configurable options This commit adds a new `listen` function that starts a server with configurable options. The function takes a `RequestListener` and an optional `ListenOptions` object. The `ListenOptions` object can be used to configure the server's name, port, hostname, showURL, baseURL, open, https, clipboard, isTest, isProd, autoClose, and autoCloseSignals. The function returns a `Listener` object that contains the server's URL, address, server, https, close, open, and showURL functions. The `listen` function uses the `node:http` and `node:https` modules to create a server and supports HTTPS with auto-generated certificates. The `listen` function also uses the `scotty-beam-me-up` module to get an available port and the `http-shutdown` module to gracefully shutdown the server. ([70f4e21](https://github.com/nyxblabs/earlist/commit/70f4e21))
  - **test): add tests for the listen function ✨ feat(test): add setup file to disable color output in tests ✨ feat(test:** Add vitest configuration file to enable coverage reporting The new files and changes add tests for the listen function, which is a function that creates a server and listens to incoming requests. The tests cover various scenarios such as listening on a specific port, listening on a random port, listening on a specific hostname, and listening on a specific path. The setup file disables color output in tests, and the vitest configuration file enables coverage reporting. ([b5e0d99](https://github.com/nyxblabs/earlist/commit/b5e0d99))

### 🏡 Chore

  - Add .eslintignore, .eslintrc, .gitignore, and update package.json scripts The .eslintignore file is added to ignore certain directories from being linted. The .eslintrc file is added to configure the eslint rules and settings. The .gitignore file is added to ignore certain files and directories from being tracked by git. The package.json scripts are updated to include new scripts for building, linting, testing, and releasing the application. These changes improve the development workflow and ensure code quality. ([c69175c](https://github.com/nyxblabs/earlist/commit/c69175c))
  - **.eslintignore): add README.md to ignored files 🎨 style(.github/assets): add cover-github-earlist.png ✨ feat(README.md:** Add documentation for earlist package The first commit adds README.md to the list of ignored files in .eslintignore. The second commit adds the cover-github-earlist.png file to the .github/assets directory. The third commit adds documentation for the earlist package to the README.md file. It includes information on how to install, import, and use the package, as well as a list of features and options. ([19db464](https://github.com/nyxblabs/earlist/commit/19db464))

### ❤️  Contributors

- Nyxb <contact@nyxb.xyz>

