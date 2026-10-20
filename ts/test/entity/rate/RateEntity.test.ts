

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


describe('RateEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when FRANKFURTER_TEST_LIVE=TRUE.
  afterEach(liveDelay('FRANKFURTER_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = FrankfurterSDK.test()
    const ent = testsdk.Rate()
    assert(null != ent)
  })


  class FailHook extends BaseFeature {
    name = 'failhook'
    version = '0.0.1'
    active = true
    unexpected = 0
    init() { }
    PreSpec() { throw new Error('rate hook failed') }
    PreUnexpected() { this.unexpected++ }
  }

  test('stream-error', async () => {
    const offline = { net: { offline: true } }
    await assert.rejects(async () => {
      for await (const _item of FrankfurterSDK.test(offline).Rate().stream('list')) { }
    }, /offline/)

    for await (const _item of FrankfurterSDK.test(offline).Rate()
      .stream('list', undefined, { ctrl: { throw: false } })) { }

    if (null != (config as any).feature?.rbac) {
      const denied = FrankfurterSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } })
      await assert.rejects(async () => {
        for await (const _item of denied.Rate().stream('list')) { }
      }, (err: any) => 'rbac_denied' === err.code)
    }
  })

  test('stream-ctrl', async () => {
    const explain: any = {}
    const ctrl: any = { explain }
    for await (const _item of FrankfurterSDK.test().Rate().stream('list', undefined, { ctrl })) { }
    assert.deepStrictEqual(Object.keys(ctrl), ['explain'])
    assert(explain === ctrl.explain && 0 < Object.keys(explain).length)
  })

  test('unexpected', async () => {
    const hook = new FailHook()
    const client = new FrankfurterSDK({ feature: { test: { active: true } }, extend: [hook] })
    await assert.rejects(client.Rate().list(), /hook failed/)
    assert(0 < hook.unexpected)

    const fired = hook.unexpected
    assert.strictEqual(await client.Rate().list(undefined, { throw: false }), undefined)
    assert(fired < hook.unexpected)
  })

  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = FrankfurterSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Rate().list({"base":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.FRANKFURTER_TEST_LIVE
    for (const op of ['list']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'rate.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"base":{"a":true,"h":"Base","n":"base","r":true,"sh":"Base currency or accounting unit code","t":"`$STRING`","key$":"base","index$":0},"date":{"a":true,"fo":"date","h":"Date","n":"date","r":true,"sh":"The date of the rate","t":"`$STRING`","key$":"date","index$":1},"id":{"a":true,"h":"Id","n":"id","r":false,"t":"`$STRING`","key$":"id","index$":2},"providers":{"a":true,"h":"Providers","n":"providers","r":false,"sh":"Per-provider rates for this pair.","t":"`$ARRAY`","key$":"providers","index$":3},"quote":{"a":true,"h":"Quote","n":"quote","r":true,"sh":"Quote currency or accounting unit code","t":"`$STRING`","key$":"quote","index$":4},"rate":{"a":true,"h":"Rate","n":"rate","r":true,"sh":"Exchange rate value","t":"`$NUMBER`","key$":"rate","index$":5}},"id":{"field":"id","from":{"base":"base","quote":"quote"},"name":"id","parts":["base","quote"],"sep":"/"},"name":"rate","op":{"list":{"input":"data","name":"list","points":[{"a":true,"co":{"id":"GET /providers/{provider}/rates","source":"openapi3","version":2},"g":{"params":[{"a":true,"ex":"ECB","k":"param","n":"provider","or":"provider","r":true,"t":"`$STRING`","index$":0}],"query":[{"a":true,"ex":"USD","k":"query","n":"base","or":"base","r":false,"t":"`$STRING`","index$":0},{"a":true,"ex":"2024-01-15","k":"query","n":"date","or":"date","r":false,"t":"`$STRING`","index$":1},{"a":true,"ex":"providers","k":"query","n":"expand","or":"expand","r":false,"t":"`$STRING`","index$":2},{"a":true,"ex":"2024-01-01","k":"query","n":"from","or":"from","r":false,"t":"`$STRING`","index$":3},{"a":true,"ex":"month","k":"query","n":"group","or":"group","r":false,"t":"`$STRING`","index$":4},{"a":true,"ex":"USD,GBP,JPY","k":"query","n":"quote","or":"quotes","r":false,"t":"`$STRING`","index$":5},{"a":true,"ex":"2024-01-31","k":"query","n":"to","or":"to","r":false,"t":"`$STRING`","index$":6}]},"k":"http","m":"GET","o":"/providers/{provider}/rates","q":{"exist":["provider"]},"r":{},"rs":{"alternatives":[{"binary":true,"kind":"raw","media":"application/x-ndjson"}],"kind":"json","media":"application/json"},"s":[{"lit":"providers"},{"var":"provider"},{"lit":"rates"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0},{"a":true,"co":{"id":"GET /rates","source":"openapi3","version":2},"g":{"query":[{"a":true,"ex":"USD","k":"query","n":"base","or":"base","r":false,"t":"`$STRING`","index$":0},{"a":true,"ex":"2024-01-15","k":"query","n":"date","or":"date","r":false,"t":"`$STRING`","index$":1},{"a":true,"ex":"providers","k":"query","n":"expand","or":"expand","r":false,"t":"`$STRING`","index$":2},{"a":true,"ex":"2024-01-01","k":"query","n":"from","or":"from","r":false,"t":"`$STRING`","index$":3},{"a":true,"ex":"month","k":"query","n":"group","or":"group","r":false,"t":"`$STRING`","index$":4},{"a":true,"ex":"ECB,TCMB","k":"query","n":"provider","or":"providers","r":false,"t":"`$STRING`","index$":5},{"a":true,"ex":"USD,GBP,JPY","k":"query","n":"quote","or":"quotes","r":false,"t":"`$STRING`","index$":6},{"a":true,"ex":"2024-01-31","k":"query","n":"to","or":"to","r":false,"t":"`$STRING`","index$":7}]},"k":"http","m":"GET","o":"/rates","q":{},"r":{},"rs":{"alternatives":[{"binary":true,"kind":"raw","media":"application/x-ndjson"}],"kind":"json","media":"application/json"},"s":[{"lit":"rates"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":1}],"key$":"list"},"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /providers/{provider}/rate/{base}/{quote}","source":"openapi3","version":2},"g":{"params":[{"a":true,"ex":"EUR","k":"param","n":"base","or":"base","r":true,"t":"`$STRING`","index$":0},{"a":true,"ex":"ECB","k":"param","n":"provider","or":"provider","r":true,"t":"`$STRING`","index$":1},{"a":true,"ex":"USD","k":"param","n":"quote","or":"quote","r":true,"t":"`$STRING`","index$":2}],"query":[{"a":true,"ex":"2024-01-15","k":"query","n":"date","or":"date","r":false,"t":"`$STRING`","index$":0}]},"k":"http","m":"GET","o":"/providers/{provider}/rate/{base}/{quote}","q":{"exist":["base","provider","quote"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"providers"},{"var":"provider"},{"lit":"rate"},{"var":"base"},{"var":"quote"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0},{"a":true,"co":{"id":"GET /rate/{base}/{quote}","source":"openapi3","version":2},"g":{"params":[{"a":true,"ex":"EUR","k":"param","n":"base","or":"base","r":true,"t":"`$STRING`","index$":0},{"a":true,"ex":"USD","k":"param","n":"quote","or":"quote","r":true,"t":"`$STRING`","index$":1}],"query":[{"a":true,"ex":"2024-01-15","k":"query","n":"date","or":"date","r":false,"t":"`$STRING`","index$":0},{"a":true,"ex":"ECB,TCMB","k":"query","n":"provider","or":"providers","r":false,"t":"`$STRING`","index$":1}]},"k":"http","m":"GET","o":"/rate/{base}/{quote}","q":{"exist":["base","quote"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"rate"},{"var":"base"},{"var":"quote"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":1}],"key$":"load"}},"relations":{"ancestors":[["$.main.kit.entity.provider"],["$.main.kit.entity.provider"]]},"key$":"rate","name__orig":"rate","Name":"Rate","name_":"rate","name-":"rate","NAME":"RATE","index$":3}, {"active":true,"entity":"rate","key$":"BasicRateFlow","kind":"basic","name":"BasicRateFlow","param":{},"step":[{"a":true,"d":{},"i":{},"m":{},"o":"list","s":[],"v":[{"apply":"ItemExists","def":{"ref":"rate_ref01"}}]},{"a":false,"d":{},"i":{"ref":"rate_ref01","srcdatavar":"rate_ref01_data","suffix":"_dt0"},"m":{"base":"base01","id":"rate01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-rate_ref01"}}],"unreachable":true}]}, 'Rate', {"GET /providers/{provider}/rates":{"protocol":"http","parameters":[{"name":"provider","in":"path","required":true,"description":"Provider key, case-insensitive. See `/providers` for the list.","schema":{"type":"string","example":"ECB"},"index$":0},{"name":"date","in":"query","description":"Specific date (YYYY-MM-DD). Cannot be combined with from/to.","required":false,"schema":{"type":"string","format":"date","example":"2024-01-15"},"x-ref":"#/components/parameters/date","index$":1},{"name":"from","in":"query","description":"Start of date range (YYYY-MM-DD)","required":false,"schema":{"type":"string","format":"date","example":"2024-01-01"},"x-ref":"#/components/parameters/from","index$":2},{"name":"to","in":"query","description":"End of date range (YYYY-MM-DD). Defaults to today.","required":false,"schema":{"type":"string","format":"date","example":"2024-01-31"},"x-ref":"#/components/parameters/to","index$":3},{"name":"base","in":"query","description":"Base currency (default: EUR)","required":false,"schema":{"type":"string","default":"EUR","example":"USD"},"x-ref":"#/components/parameters/base","index$":4},{"name":"quotes","in":"query","description":"Comma-separated list of quote currencies to include","required":false,"schema":{"type":"string","example":"USD,GBP,JPY"},"x-ref":"#/components/parameters/quotes","index$":5},{"name":"group","in":"query","description":"Downsample rates by time period. Only applies to date ranges.","required":false,"schema":{"type":"string","enum":["week","month"],"example":"month"},"x-ref":"#/components/parameters/group","index$":6},{"name":"expand","in":"query","description":"Comma-separated list of optional fields to include per record. Currently supports `providers`, which adds an array of `{ key, date, rate }` objects per record showing each provider's individual observation date and rate. Outliers excluded from the blend (and providers whose rate was overridden by a currency peg) are flagged with `excluded: true`. The field is omitted on synthesized peg rows where no provider published the quote. In CSV output, the `providers` column is encoded as `KEY:RATE` pairs joined by `|`, with a trailing `*` on excluded entries (e.g. `ECB:0.92|FED:1.50*`).","required":false,"schema":{"type":"string","enum":["providers"],"example":"providers"},"x-ref":"#/components/parameters/expand","index$":7}]},"GET /rates":{"protocol":"http","parameters":[{"name":"date","in":"query","description":"Specific date (YYYY-MM-DD). Cannot be combined with from/to.","required":false,"schema":{"type":"string","format":"date","example":"2024-01-15"},"x-ref":"#/components/parameters/date","index$":0},{"name":"from","in":"query","description":"Start of date range (YYYY-MM-DD)","required":false,"schema":{"type":"string","format":"date","example":"2024-01-01"},"x-ref":"#/components/parameters/from","index$":1},{"name":"to","in":"query","description":"End of date range (YYYY-MM-DD). Defaults to today.","required":false,"schema":{"type":"string","format":"date","example":"2024-01-31"},"x-ref":"#/components/parameters/to","index$":2},{"name":"base","in":"query","description":"Base currency (default: EUR)","required":false,"schema":{"type":"string","default":"EUR","example":"USD"},"x-ref":"#/components/parameters/base","index$":3},{"name":"quotes","in":"query","description":"Comma-separated list of quote currencies to include","required":false,"schema":{"type":"string","example":"USD,GBP,JPY"},"x-ref":"#/components/parameters/quotes","index$":4},{"name":"providers","in":"query","description":"Comma-separated list of data providers to include. A single provider includes its stored non-currency series. Selecting multiple providers blends only registered currencies and accounting units.","required":false,"schema":{"type":"string","example":"ECB,TCMB"},"x-ref":"#/components/parameters/providers","index$":5},{"name":"group","in":"query","description":"Downsample rates by time period. Only applies to date ranges.","required":false,"schema":{"type":"string","enum":["week","month"],"example":"month"},"x-ref":"#/components/parameters/group","index$":6},{"name":"expand","in":"query","description":"Comma-separated list of optional fields to include per record. Currently supports `providers`, which adds an array of `{ key, date, rate }` objects per record showing each provider's individual observation date and rate. Outliers excluded from the blend (and providers whose rate was overridden by a currency peg) are flagged with `excluded: true`. The field is omitted on synthesized peg rows where no provider published the quote. In CSV output, the `providers` column is encoded as `KEY:RATE` pairs joined by `|`, with a trailing `*` on excluded entries (e.g. `ECB:0.92|FED:1.50*`).","required":false,"schema":{"type":"string","enum":["providers"],"example":"providers"},"x-ref":"#/components/parameters/expand","index$":7}]},"GET /providers/{provider}/rate/{base}/{quote}":{"protocol":"http","parameters":[{"name":"provider","in":"path","required":true,"description":"Provider key, case-insensitive. See `/providers` for the list.","schema":{"type":"string","example":"ECB"},"index$":0},{"name":"base","in":"path","required":true,"schema":{"type":"string","example":"EUR"},"index$":1},{"name":"quote","in":"path","required":true,"schema":{"type":"string","example":"USD"},"index$":2},{"name":"date","in":"query","description":"Specific date (YYYY-MM-DD). Cannot be combined with from/to.","required":false,"schema":{"type":"string","format":"date","example":"2024-01-15"},"x-ref":"#/components/parameters/date","index$":3}]},"GET /rate/{base}/{quote}":{"protocol":"http","parameters":[{"name":"base","in":"path","required":true,"schema":{"type":"string","example":"EUR"},"index$":0},{"name":"quote","in":"path","required":true,"schema":{"type":"string","example":"USD"},"index$":1},{"name":"date","in":"query","description":"Specific date (YYYY-MM-DD). Cannot be combined with from/to.","required":false,"schema":{"type":"string","format":"date","example":"2024-01-15"},"x-ref":"#/components/parameters/date","index$":2},{"name":"providers","in":"query","description":"Comma-separated list of data providers to include. A single provider includes its stored non-currency series. Selecting multiple providers blends only registered currencies and accounting units.","required":false,"schema":{"type":"string","example":"ECB,TCMB"},"x-ref":"#/components/parameters/providers","index$":3}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let rate_ref01_data = Object.values(setup.data.existing.rate)[0] as any

    // LIST
    const rate_ref01_ent = client.Rate()
    const rate_ref01_match: any = {}

    const rate_ref01_list = (await rate_ref01_ent.list(rate_ref01_match)).map((e: any) => e.data())


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
      '../../../../.sdk/test/entity/rate/RateTestData.json')

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
    ['rate01','rate02','rate03','provider01','provider02','provider03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'FRANKFURTER_TEST_RATE_ENTID': idmap,
    'FRANKFURTER_TEST_LIVE': 'FALSE',
    'FRANKFURTER_TEST_EXPLAIN': 'FALSE',
  })

  idmap = env['FRANKFURTER_TEST_RATE_ENTID']

  const live = 'TRUE' === env.FRANKFURTER_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['FRANKFURTER_TEST_RATE_ENTID']
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
  
