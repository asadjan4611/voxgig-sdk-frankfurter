
import { test, describe } from 'node:test'
import { equal } from 'node:assert'


import { FrankfurterSDK } from '..'


describe('exists', async () => {

  test('test-mode', () => {
    const testsdk = FrankfurterSDK.test()
    equal(testsdk instanceof FrankfurterSDK, true,
      'FrankfurterSDK.test() must return a client synchronously')
  })

})
