import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SDK } from '..'

test('live invalid currency returns a client error', { skip: process.env.FRANKFURTER_TEST_LIVE !== 'TRUE' }, async () => {
  const result = await new SDK().direct({
    path: '/currency/{code}',
    method: 'GET',
    params: { code: 'NOT_A_CURRENCY' },
  })
  assert.equal(result.ok, false)
  assert.equal(typeof result.status, 'number')
  assert((result.status ?? 0) >= 400 && (result.status ?? 0) < 500)
})
