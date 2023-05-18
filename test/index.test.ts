import './setup'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { afterEach, describe, expect, test } from 'vitest'
import type { Listener } from '../src'
import { listen } from '../src'

// console.log = fn()

function handle(request: IncomingMessage, response: ServerResponse) {
   response.end(request.url)
}

describe('earlist', () => {
   let listener: Listener | undefined

   afterEach(async () => {
      if (listener) {
         await listener.close()
         listener = undefined
      }
   })

   test('listen (no args)', async () => {
      listener = await listen(handle)
      expect(listener.url.startsWith('http://')).toBe(true)
   })

   test('listen (http)', async () => {
      listener = await listen(handle, {
         isTest: false,
         autoClose: false,
         baseURL: '/foo/bar',
      })
      expect(listener.url.startsWith('http://')).toBe(true)
      expect(listener.url.endsWith('/foo/bar')).toBe(true)

      // expect(console.log).toHaveBeenCalledWith(expect.stringMatching('\n  > Local:    http://localhost:3000/foo/bar'))
   })

   test('listen (https - selfsigned)', async () => {
      listener = await listen(handle, { https: true })
      expect(listener.url.startsWith('https://')).toBe(true)
   })

   test('listen (https - custom)', async () => {
      listener = await listen(handle, {
         https: {

            key: resolve(__dirname, 'fixture/cert/key.pem'),

            cert: resolve(__dirname, 'fixture/cert/cert.pem'),
         },
      })
      expect(listener.url.startsWith('https://')).toBe(true)
   })

   test('double close', async () => {
      listener = await listen(handle, { isTest: false })
      await listener.close()
      await listener.close()
   })

   test('autoClose', async () => {
      /* not passing close */ await listen(handle)
      // @ts-expect-error is fine
      process.emit('exit')
   })

   test('pass hostname to scotty-beam-me-up', async () => {
      listener = await listen(handle, { hostname: '127.0.0.1' })
      expect(listener.url.startsWith('http://localhost')).toBe(true)
   })

   test('pass port to scotty-beam-me-up', async () => {
      listener = await listen(handle, { port: 40_000 })
      expect(listener.url.endsWith(':40000/')).toBe(true)
   })

   test('pass extended options to scotty-beam-me-up', async () => {
      listener = await listen(handle, {
         port: { port: 50_000, portRange: [50_000, 59_999] },
      })
      expect(listener.url).toMatch(/:5\d{4}\/$/)
   })

   test('should listen to the next port in range (3000 -> 31000)', async () => {
      listener = await listen(handle, {
         port: { port: 3000 },
      })
      expect(listener.url).toMatch(/:3000\/$/)
      const listener2 = await listen(handle, {
         port: { port: 3000 },
      })
      expect(listener2.url).toMatch(/:3001\/$/)
      await listener2.close()
   })
})
