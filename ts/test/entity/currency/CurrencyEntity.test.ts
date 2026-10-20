

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'
import { createLiveTransport } from '../../live-runner'
import { runLiveEntity } from '../../live-entity'


import { FrankfurterSDK, BaseFeature, config, stdutil } from '../../..'

import {
  envOverride,
  liveClientOptions,
  liveDelay,
  loadEnvLocal,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
  maybeSkipControl,
} from '../../utility'


loadEnvLocal(__dirname + '/../../../.env.local')


describe('CurrencyEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when FRANKFURTER_TEST_LIVE=TRUE.
  afterEach(liveDelay('FRANKFURTER_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = FrankfurterSDK.test()
    const ent = testsdk.Currency()
    assert(null != ent)
  })


  class FailHook extends BaseFeature {
    name = 'failhook'
    version = '0.0.1'
    active = true
    unexpected = 0
    init() { }
    PreSpec() { throw new Error('currency hook failed') }
    PreUnexpected() { this.unexpected++ }
  }

  test('stream-error', async () => {
    const offline = { net: { offline: true } }
    await assert.rejects(async () => {
      for await (const _item of FrankfurterSDK.test(offline).Currency().stream('list')) { }
    }, /offline/)

    for await (const _item of FrankfurterSDK.test(offline).Currency()
      .stream('list', undefined, { ctrl: { throw: false } })) { }

    if (null != (config as any).feature?.rbac) {
      const denied = FrankfurterSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } })
      await assert.rejects(async () => {
        for await (const _item of denied.Currency().stream('list')) { }
      }, (err: any) => 'rbac_denied' === err.code)
    }
  })

  test('stream-ctrl', async () => {
    const explain: any = {}
    const ctrl: any = { explain }
    for await (const _item of FrankfurterSDK.test().Currency().stream('list', undefined, { ctrl })) { }
    assert.deepStrictEqual(Object.keys(ctrl), ['explain'])
    assert(explain === ctrl.explain && 0 < Object.keys(explain).length)
  })

  test('unexpected', async () => {
    const hook = new FailHook()
    const client = new FrankfurterSDK({ feature: { test: { active: true } }, extend: [hook] })
    await assert.rejects(client.Currency().list(), /hook failed/)
    assert(0 < hook.unexpected)

    const fired = hook.unexpected
    assert.strictEqual(await client.Currency().list(undefined, { throw: false }), undefined)
    assert(fired < hook.unexpected)
  })

  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = FrankfurterSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Currency().list({"provider":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.FRANKFURTER_TEST_LIVE
    for (const op of ['list', 'load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'currency.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"end_date":{"a":true,"fo":"date","h":"End Date","n":"end_date","r":false,"sh":"Latest publication coverage date; use /coverage for queryable pairs","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"end_date","index$":0},"id":{"a":true,"h":"Id","n":"id","r":false,"t":"`$STRING`","key$":"id","index$":1},"iso_code":{"a":true,"h":"Iso Code","n":"iso_code","r":true,"sh":"Currency or accounting unit code","t":"`$STRING`","key$":"iso_code","index$":2},"iso_numeric":{"a":true,"h":"Iso Numeric","n":"iso_numeric","r":false,"sh":"ISO 4217 numeric code","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"iso_numeric","index$":3},"name":{"a":true,"h":"Name","n":"name","r":true,"sh":"Full currency name","t":"`$STRING`","key$":"name","index$":4},"peg":{"a":true,"h":"Peg","n":"peg","r":false,"sh":"Peg metadata, present only for pegged currencies","t":"`$OBJECT`","key$":"peg","index$":5},"providers":{"a":true,"h":"Providers","n":"providers","r":false,"sh":"Provider keys that publish this currency","t":"`$ARRAY`","key$":"providers","index$":6},"start_date":{"a":true,"fo":"date","h":"Start Date","n":"start_date","r":false,"sh":"Earliest publication coverage date; use /coverage for queryable pairs","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"start_date","index$":7},"symbol":{"a":true,"h":"Symbol","n":"symbol","r":false,"sh":"Currency symbol","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"symbol","index$":8}},"id":{"field":"id","name":"id"},"name":"currency","op":{"list":{"input":"data","name":"list","points":[{"a":true,"co":{"id":"GET /currencies","source":"openapi3","version":2},"g":{"query":[{"a":true,"ex":"ECB,TCMB","k":"query","n":"provider","or":"providers","r":false,"t":"`$STRING`","index$":0},{"a":true,"k":"query","n":"scope","or":"scope","r":false,"t":"`$STRING`","index$":1}]},"k":"http","m":"GET","o":"/currencies","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"currencies"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"list"},"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /currency/{code}","source":"openapi3","version":2},"g":{"params":[{"a":true,"ex":"USD","k":"param","n":"id","or":"code","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"GET","o":"/currency/{code}","q":{"exist":["id"]},"r":{"param":{"code":"id"}},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"currency"},{"var":"id"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"currency","name__orig":"currency","Name":"Currency","name_":"currency","name-":"currency","NAME":"CURRENCY","index$":1}, {"active":true,"entity":"currency","key$":"BasicCurrencyFlow","kind":"basic","name":"BasicCurrencyFlow","param":{},"step":[{"a":true,"d":{},"i":{},"m":{},"o":"list","s":[],"v":[{"apply":"ItemExists","def":{"ref":"currency_ref01"}}]},{"a":true,"d":{},"i":{"ref":"currency_ref01","srcdatavar":"currency_ref01_data","suffix":"_dt0"},"m":{"id":"currency01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-currency_ref01"}}]}]}, 'Currency', {"GET /currencies":{"protocol":"http","parameters":[{"name":"scope","in":"query","description":"Set to 'all' to include legacy currencies. Omit for the default list. Other values, including an empty string, return 422.","required":false,"schema":{"type":"string","enum":["all"]},"index$":0},{"name":"providers","in":"query","description":"Comma-separated list of data providers to include. A single provider includes its stored non-currency series. Selecting multiple providers blends only registered currencies and accounting units.","required":false,"schema":{"type":"string","example":"ECB,TCMB"},"x-ref":"#/components/parameters/providers","index$":1}]},"GET /currency/{code}":{"protocol":"http","parameters":[{"name":"code","in":"path","required":true,"schema":{"type":"string","example":"USD"},"index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let currency_ref01_data = Object.values(setup.data.existing.currency)[0] as any

    // LIST
    const currency_ref01_ent = client.Currency()
    const currency_ref01_match: any = {}

    const currency_ref01_list = (await currency_ref01_ent.list(currency_ref01_match)).map((e: any) => e.data())


    // LOAD
    const currency_ref01_match_dt0: any = {}
    currency_ref01_match_dt0.id = currency_ref01_data.id
    const currency_ref01_data_dt0 = (await currency_ref01_ent.load(currency_ref01_match_dt0)).data()
    assert(currency_ref01_data_dt0.id === currency_ref01_data.id)


  })
})



// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true

function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/currency/CurrencyTestData.json')

  // TODO: file ready util needed?
  const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8')

  // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
  const entityData = JSON.parse(entityDataSource)

  options.entity = entityData.existing

  let client = FrankfurterSDK.test(options, extra)
  const struct = client.utility().struct
  const merge = struct.merge
  const transform = struct.transform

  let idmap = transform(
    ['currency01','currency02','currency03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'FRANKFURTER_TEST_CURRENCY_ENTID': idmap,
    'FRANKFURTER_TEST_LIVE': 'FALSE',
    'FRANKFURTER_TEST_EXPLAIN': 'FALSE',
  })

  idmap = env['FRANKFURTER_TEST_CURRENCY_ENTID']

  const live = 'TRUE' === env.FRANKFURTER_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['FRANKFURTER_TEST_CURRENCY_ENTID']
    idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {}
    if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
      throw new Error('Live ENTID must be a JSON object')
    }
    client = new FrankfurterSDK(merge([
      // FIRST, so the generated fields below win: sdk-test-control.json's
      // test.client.options adds to the live client, it does not redirect it.
      liveClientOptions(),
      {
      },
      // 'extra || {}', not a bare 'extra': struct.merge returns UNDEFINED when the
      // last entry is undefined, and basicSetup is normally called with no
      // argument at all - so a bare 'extra' silently discarded the apikey
      // and server values above and handed the SDK undefined. Harmless
      // while there was nothing in that object; not harmless now.
      extra || {},
      { system: { fetch: transport.fetch } }
    ]))
  }

  const setup = {
    idmap,
    env,
    options,
    client,
    struct,
    data: entityData,
    explain: 'TRUE' === env.FRANKFURTER_TEST_EXPLAIN,
    live,
    transport,
    now: Date.now(),
  }

  return setup
}
  
