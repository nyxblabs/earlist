/**
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 * Inlined for ESM support
 * MIT
 */
// @ts-nocheck
import childProcess from 'node:child_process'
import {
   chmodSync,
   existsSync,
   promises as fs,
   constants as fsConstants,
   readFileSync,
   statSync,
   writeFileSync,
} from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'

const { platform, arch } = process

/**
Get the mount point for fixed drives in WSL.

@inner
@returns {string} The mount point.
*/
const getWslDrivesMountPoint = (() => {
   // Default value for "root" param
   // according to https://docs.microsoft.com/en-us/windows/wsl/wsl-config
   const defaultMountPoint = '/mnt/'

   let mountPoint

   return async function () {
      if (mountPoint) {
      // Return memoized mount point value
         return mountPoint
      }

      const configFilePath = '/etc/wsl.conf'

      let isConfigFileExists = false
      try {
         await fs.access(configFilePath, fsConstants.F_OK)
         isConfigFileExists = true
      }
      catch {}

      if (!isConfigFileExists)
         return defaultMountPoint

      const configContent = await fs.readFile(configFilePath, {
         encoding: 'utf8',
      })
      const configMountPoint = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(
         configContent,
      )

      if (!configMountPoint)
         return defaultMountPoint

      mountPoint = configMountPoint.groups.mountPoint.trim()
      mountPoint = mountPoint.endsWith('/') ? mountPoint : `${mountPoint}/`

      return mountPoint
   }
})()

async function pTryEach(array, mapper) {
   let latestError

   for (const item of array) {
      try {
         return await mapper(item)
      }
      catch (error) {
         latestError = error
      }
   }

   throw latestError
}

async function baseOpen(options) {
   options = {
      wait: false,
      background: false,
      newInstance: false,
      allowNonzeroExitCode: false,
      ...options,
   }

   if (Array.isArray(options.app)) {
      return pTryEach(options.app, singleApp =>
         baseOpen({
            ...options,
            app: singleApp,
         }),
      )
   }

   let { name: app, arguments: appArguments = [] } = options.app || {}
   appArguments = [...appArguments]

   if (Array.isArray(app)) {
      return pTryEach(app, appName =>
         baseOpen({
            ...options,
            app: {
               name: appName,
               arguments: appArguments,
            },
         }),
      )
   }

   let command
   const cliArguments = []
   const childProcessOptions = {}

   if (platform === 'darwin') {
      command = 'open'

      if (options.wait)
         cliArguments.push('--wait-apps')

      if (options.background)
         cliArguments.push('--background')

      if (options.newInstance)
         cliArguments.push('--new')

      if (app)
         cliArguments.push('-a', app)
   }
   else if (platform === 'win32' || (isWsl() && !isDocker())) {
      const mountPoint = await getWslDrivesMountPoint()

      command = isWsl()
         ? `${mountPoint}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`
         : `${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\powershell`

      cliArguments.push(
         '-NoProfile',
         '-NonInteractive',
         '–ExecutionPolicy',
         'Bypass',
         '-EncodedCommand',
      )

      if (!isWsl())
         childProcessOptions.windowsVerbatimArguments = true

      const encodedArguments = ['Start']

      if (options.wait)
         encodedArguments.push('-Wait')

      if (app) {
      // Double quote with double quotes to ensure the inner quotes are passed through.
      // Inner quotes are delimited for PowerShell interpretation with backticks.
         encodedArguments.push(`"\`"${app}\`""`, '-ArgumentList')
         if (options.target)
            appArguments.unshift(options.target)
      }
      else if (options.target) {
         encodedArguments.push(`"${options.target}"`)
      }

      if (appArguments.length > 0) {
         appArguments = appArguments.map(argument => `"\`"${argument}\`""`)
         encodedArguments.push(appArguments.join(','))
      }

      // Using Base64-encoded command, accepted by PowerShell, to allow special characters.
      options.target = Buffer.from(
         encodedArguments.join(' '),
         'utf16le',
      ).toString('base64')
   }
   else {
      if (app) {
         command = app
      }
      else {
         command = 'xdg-open'
         const useSystemXdgOpen
        = process.versions.electron || platform === 'android'
         if (!useSystemXdgOpen) {
            command = join(os.tmpdir(), 'xdg-open')
            if (!existsSync(command)) {
               try {
                  writeFileSync(
                     join(os.tmpdir(), 'xdg-open'),
                     await import('./xdg-open').then(r => r.xdgOpenScript()),
                     'utf8',
                  )
                  chmodSync(command, 0o755 /* rwx r-x r-x */)
               }
               catch {
                  command = 'xdg-open'
               }
            }
         }
      }

      if (appArguments.length > 0)
         cliArguments.push(...appArguments)

      if (!options.wait) {
      // `xdg-open` will block the process unless stdio is ignored
      // and it's detached from the parent even if it's unref'd.
         childProcessOptions.stdio = 'ignore'
         childProcessOptions.detached = true
      }
   }

   if (options.target)
      cliArguments.push(options.target)

   if (platform === 'darwin' && appArguments.length > 0)
      cliArguments.push('--args', ...appArguments)

   const subprocess = childProcess.spawn(
      command,
      cliArguments,
      childProcessOptions,
   )

   if (options.wait) {
      return new Promise((resolve, reject) => {
         subprocess.once('error', reject)

         subprocess.once('close', (exitCode) => {
            if (options.allowNonzeroExitCode && exitCode > 0) {
               reject(new Error(`Exited with code ${exitCode}`))
               return
            }

            resolve(subprocess)
         })
      })
   }

   subprocess.unref()

   return subprocess
}

export function open(target, options = {}) {
   if (typeof target !== 'string')
      throw new TypeError('Expected a `target`')

   return baseOpen({
      ...options,
      target,
   })
}

function openApp(name, options) {
   if (typeof name !== 'string')
      throw new TypeError('Expected a `name`')

   const { arguments: appArguments = [] } = options || {}
   if (
      appArguments !== undefined
    && appArguments !== null
    && !Array.isArray(appArguments)
   )
      throw new TypeError('Expected `appArguments` as Array type')

   return baseOpen({
      ...options,
      app: {
         name,
         arguments: appArguments,
      },
   })
}

function detectArchBinary(binary) {
   if (typeof binary === 'string' || Array.isArray(binary))
      return binary

   const { [arch]: archBinary } = binary

   if (!archBinary)
      throw new Error(`${arch} is not supported`)

   return archBinary
}

function detectPlatformBinary({ [platform]: platformBinary }, { wsl }) {
   if (wsl && isWsl())
      return detectArchBinary(wsl)

   if (!platformBinary)
      throw new Error(`${platform} is not supported`)

   return detectArchBinary(platformBinary)
}

const apps = {}

defineLazyProperty(apps, 'chrome', () =>
   detectPlatformBinary(
      {
         darwin: 'google chrome',
         win32: 'chrome',
         linux: ['google-chrome', 'google-chrome-stable', 'chromium'],
      },
      {
         wsl: {
            ia32: '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            x64: [
               '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
               '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            ],
         },
      },
   ),
)

defineLazyProperty(apps, 'firefox', () =>
   detectPlatformBinary(
      {
         darwin: 'firefox',
         win32: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
         linux: 'firefox',
      },
      {
         wsl: '/mnt/c/Program Files/Mozilla Firefox/firefox.exe',
      },
   ),
)

defineLazyProperty(apps, 'edge', () =>
   detectPlatformBinary(
      {
         darwin: 'microsoft edge',
         win32: 'msedge',
         linux: ['microsoft-edge', 'microsoft-edge-dev'],
      },
      {
         wsl: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      },
   ),
)

open.apps = apps
open.openApp = openApp

// npm: define-lazy-prop
function defineLazyProperty(object, propertyName, valueGetter) {
   const define = value =>
      Object.defineProperty(object, propertyName, {
         value,
         enumerable: true,
         writable: true,
      })
   Object.defineProperty(object, propertyName, {
      configurable: true,
      enumerable: true,
      get() {
         const result = valueGetter()
         define(result)
         return result
      },
      set(value) {
         define(value)
      },
   })
   return object
}

// npm: is-wsl
function _isWsl() {
   if (process.platform !== 'linux')
      return false

   if (os.release().toLowerCase().includes('microsoft')) {
      if (isDocker())
         return false

      return true
   }
   try {
      return readFileSync('/proc/version', 'utf8')
         .toLowerCase()
         .includes('microsoft')
         ? !isDocker()
         : false
   }
   catch {
      return false
   }
}
let isWSLCached
function isWsl() {
   if (isWSLCached === undefined)
      isWSLCached = _isWsl()

   return isWSLCached
}

// npm: is-docker
function hasDockerEnvironment() {
   try {
      statSync('/.dockerenv')
      return true
   }
   catch {
      return false
   }
}
function hasDockerCGroup() {
   try {
      return readFileSync('/proc/self/cgroup', 'utf8').includes('docker')
   }
   catch {
      return false
   }
}
let isDockerCached
function isDocker() {
   // TODO: Use `??=` when targeting Node.js 16.
   if (isDockerCached === undefined)
      isDockerCached = hasDockerEnvironment() || hasDockerCGroup()

   return isDockerCached
}
