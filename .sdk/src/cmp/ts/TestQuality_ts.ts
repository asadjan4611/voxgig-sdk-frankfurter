import { cmp, File, Content } from '@voxgig/sdkgen'


const TestQuality = cmp(function TestQuality(_props: any) {
  File({ name: 'quality.test.ts' }, () => Content(`import assert from 'node:assert/strict'
import { inspect } from 'node:util'
import { test } from 'node:test'

import { FrankfurterSDK } from '..'
import { Control } from '../dist/Control'
import { Point } from '../dist/Point'
import { Response } from '../dist/Response'
import { BaseFeature } from '../dist/feature/base/BaseFeature'
import { graphqlBody, graphqlErrorCode, graphqlErrors } from '../dist/utility/GraphqlUtility'
import { acceptOf, isJsonMedia, isJsonRequest, isRawRequest, isRawValue,
  isStream, mediaHeaders, rawBody, readStream } from '../dist/utility/MediaUtility'
import { cookieKeep } from '../dist/utility/PrepareHeadersUtility'
import { prepareHeaders } from '../dist/utility/PrepareHeadersUtility'
import { prepareQuery } from '../dist/utility/PrepareQueryUtility'
import { transformRequest } from '../dist/utility/TransformRequestUtility'

test('public runtime value objects preserve their inputs and defaults', async () => {
  const signal = new AbortController().signal
  const control = new Control({ throw: false, err: 'err', explain: {}, signal })
  assert.equal(control.throw, false)
  assert.equal(control.err, 'err')
  assert.equal(control.signal, signal)

  const point = new Point({ method: 'GET', orig: '/currencies', active: false })
  assert.equal(point.method, 'GET')
  assert.equal(point.orig, '/currencies')
  assert.equal(point.active, false)
  assert.deepEqual(point.parts, [])

  const empty = new Response({ status: 204, text: async () => '' })
  assert.equal(await empty.json(), undefined)
  const parsed = new Response({ status: 200, text: async () => '{"ok":true}' })
  assert.deepEqual(await parsed.json(), { ok: true })
  const invalid = new Response({ status: 500, text: async () => 'not-json' })
  await assert.rejects(invalid.json(), /Unexpected token|Unexpected character/)
})

test('entity helper methods expose safe copies and lifecycle state', () => {
  const client = FrankfurterSDK.test()
  const entity = client.Coverage({ active: true })
  entity.data({ base: 'EUR', start_date: null, end_date: null,
    providers: null, quotes: null })
  entity.match({ base: 'EUR' })

  assert.equal(entity.client(), client)
  assert.deepEqual(entity.entopts(), { active: true })
  assert.equal(entity.data().base, 'EUR')
  assert.equal(entity.match().base, 'EUR')
  assert.notEqual(entity.make(), entity)
  assert.equal(entity.deleted(), false)
  entity.markDeleted()
  assert.equal(entity.deleted(), true)
  assert.equal(entity.toJSON()['voxgig$entity'], 'Coverage')
  assert.match(entity.toString(), /^Coverage /)
  assert.equal((entity as any)[inspect.custom](), entity.toString())
  assert.deepEqual(client.toJSON(), { name: 'Frankfurter' })
  assert(client.tester() instanceof FrankfurterSDK)
})

test('base feature hooks and abort helper implement their no-op contract', async () => {
  const feature = new BaseFeature()
  const ctx: any = {}
  await feature.init(ctx, {})
  for (const name of ['PostConstruct', 'PostConstructEntity', 'SetData', 'GetData',
    'SetMatch', 'GetMatch', 'PrePoint', 'PreSpec', 'PreRequest', 'PreResponse',
    'PreResult', 'PreDone', 'PreUnexpected']) {
    assert.equal((feature as any)[name](ctx), undefined)
  }
  assert.equal(await feature._untilAbort(Promise.resolve('done')), 'done')
  const controller = new AbortController()
  controller.abort(new Error('stopped'))
  await assert.rejects(feature._untilAbort(Promise.resolve('unused'), controller.signal), /stopped/)
})

test('media helpers cover JSON, raw bodies, streams, and cookie filtering', async () => {
  assert.equal(isJsonMedia('application/problem+json; charset=utf-8'), true)
  assert.equal(isJsonMedia('text/plain'), false)
  assert.equal(acceptOf({ response: { kind: 'json', media: 'application/json' } }), 'application/json')
  assert.equal(isJsonRequest({ body: { kind: 'json' } }), true)
  assert.equal(isRawRequest({ body: { kind: 'raw' } }), true)
  assert.deepEqual(mediaHeaders({ response: { kind: 'json', media: 'application/json' } }, {}),
    { accept: 'application/json' })
  assert.equal(rawBody({ '$body': 'payload' }), 'payload')
  assert.deepEqual(cookieKeep('keep=1; drop=2', ['drop']), ['keep=1'])

  async function* chunks() { yield 'ab'; yield new Uint8Array([99]) }
  const stream = chunks()
  assert.equal(isStream(stream), true)
  assert.equal(isRawValue(stream), true)
  const bytes = await readStream(stream)
  assert.equal(new TextDecoder().decode(bytes), 'abc')

  const webStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([100]))
      controller.close()
    },
  })
  assert.equal(new TextDecoder().decode(await readStream(webStream)), 'd')
  assert.equal(isRawValue(new ArrayBuffer(1)), true)
  assert.equal(isRawValue(new Blob(['x'])), true)
  assert.equal(acceptOf({ response: { kind: 'raw', media: 'text/csv',
    alternatives: [{ media: 'application/x-ndjson' }] } }),
  'text/csv, application/x-ndjson')
})

test('request routing helpers serialize headers, cookies, query, and body independently', () => {
  const client = new FrankfurterSDK({
    headers: { Cookie: 'keep=1; drop=old', 'X-Token': 'old' },
  })
  const utility: any = client.utility()
  const point: any = {
    body: { kind: 'json', media: 'application/json' },
    response: { kind: 'json', media: 'application/json' },
    args: {
      header: [{ name: 'token', orig: 'X-Token' }],
      cookie: [
        { name: 'drop', orig: 'drop' },
        { name: 'prefs', orig: 'prefs' },
      ],
      query: [{ name: 'base', orig: 'base_currency' }],
      params: [{ name: 'code' }],
    },
    params: [],
    transform: { req: (ctx: any) => ({
      body: ctx.reqdata.body,
      '$action': ctx.reqdata['$action'],
    }) },
  }
  const ctx: any = {
    client,
    utility,
    point,
    reqmatch: { token: 'new', drop: 'fresh', prefs: ['a b', 'c'],
      base: 'EUR', code: 'USD', extra: 'kept' },
    reqdata: { routed: 'remove', body: 'kept', '$action': 'ignored' },
    match: {},
    data: {},
    spec: {},
  }

  assert.deepEqual(prepareHeaders(ctx), {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-token': 'new',
    cookie: 'keep=1; drop=fresh; prefs=a%20b; prefs=c',
  })
  assert.deepEqual(prepareQuery(ctx), {
    base_currency: 'EUR',
    extra: 'kept',
  })
  assert.deepEqual(transformRequest(ctx), { body: 'kept' })

  point.args.cookie = [{ name: 'cookieMap', orig: 'unused' }]
  ctx.reqmatch = { cookieMap: { theme: 'dark mode', compact: true } }
  assert.equal(prepareHeaders(ctx).cookie,
    'keep=1; drop=old; compact=true; theme=dark%20mode')
})

test('Response supports native json readers and absent readers', async () => {
  const value = { ok: true }
  const native = new Response({ status: 200, json() { return value } })
  assert.equal(await native.json(), value)
  const missing = new Response({ status: 204 })
  assert.equal(await missing.json(), undefined)
})

test('GraphQL helpers remain deterministic even for this REST API', () => {
  assert.equal(graphqlErrorCode({ extensions: { code: 'UNAUTHENTICATED' } }), 'request_auth')
  assert.equal(graphqlErrorCode({ extensions: { type: 'RATE_LIMITED' } }), 'request_ratelimit')
  assert.equal(graphqlErrorCode({ extensions: { code: 'BAD_USER_INPUT' } }), 'request_invalid')
  assert.equal(graphqlErrorCode({}), 'request_graphql')

  const client = new FrankfurterSDK()
  const ctx: any = {
    utility: client.utility(),
    point: { kind: 'graphql', graphql: { doc: 'query Q($code: String!) { q }',
      vars: [{ name: 'code', from: 'code' }] } },
    op: { input: 'data' },
    reqdata: { code: 'USD' },
    data: {},
  }
  assert.deepEqual(graphqlBody(ctx), {
    query: 'query Q($code: String!) { q }', variables: { code: 'USD' },
  })
  ctx.result = { ok: true, body: { errors: [{ message: 'bad input',
    extensions: { code: 'BAD_USER_INPUT' } }] } }
  ctx.error = (code: string, message: string) => Object.assign(new Error(message), { code })
  assert.equal(graphqlErrors(ctx), true)
  assert.equal(ctx.result.ok, false)
  assert.equal(ctx.result.err.code, 'request_invalid')
})
`))
})


export { TestQuality }
