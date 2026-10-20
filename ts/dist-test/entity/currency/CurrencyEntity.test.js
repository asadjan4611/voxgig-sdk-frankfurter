"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const Fs = __importStar(require("node:fs"));
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const live_runner_1 = require("../../live-runner");
const live_entity_1 = require("../../live-entity");
const __1 = require("../../..");
const utility_1 = require("../../utility");
(0, utility_1.loadEnvLocal)(__dirname + '/../../../.env.local');
(0, node_test_1.describe)('CurrencyEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when FRANKFURTER_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('FRANKFURTER_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.FrankfurterSDK.test();
        const ent = testsdk.Currency();
        (0, node_assert_1.default)(null != ent);
    });
    class FailHook extends __1.BaseFeature {
        name = 'failhook';
        version = '0.0.1';
        active = true;
        unexpected = 0;
        init() { }
        PreSpec() { throw new Error('currency hook failed'); }
        PreUnexpected() { this.unexpected++; }
    }
    (0, node_test_1.test)('stream-error', async () => {
        const offline = { net: { offline: true } };
        await node_assert_1.default.rejects(async () => {
            for await (const _item of __1.FrankfurterSDK.test(offline).Currency().stream('list')) { }
        }, /offline/);
        for await (const _item of __1.FrankfurterSDK.test(offline).Currency()
            .stream('list', undefined, { ctrl: { throw: false } })) { }
        if (null != __1.config.feature?.rbac) {
            const denied = __1.FrankfurterSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } });
            await node_assert_1.default.rejects(async () => {
                for await (const _item of denied.Currency().stream('list')) { }
            }, (err) => 'rbac_denied' === err.code);
        }
    });
    (0, node_test_1.test)('stream-ctrl', async () => {
        const explain = {};
        const ctrl = { explain };
        for await (const _item of __1.FrankfurterSDK.test().Currency().stream('list', undefined, { ctrl })) { }
        node_assert_1.default.deepStrictEqual(Object.keys(ctrl), ['explain']);
        (0, node_assert_1.default)(explain === ctrl.explain && 0 < Object.keys(explain).length);
    });
    (0, node_test_1.test)('unexpected', async () => {
        const hook = new FailHook();
        const client = new __1.FrankfurterSDK({ feature: { test: { active: true } }, extend: [hook] });
        await node_assert_1.default.rejects(client.Currency().list(), /hook failed/);
        (0, node_assert_1.default)(0 < hook.unexpected);
        const fired = hook.unexpected;
        node_assert_1.default.strictEqual(await client.Currency().list(undefined, { throw: false }), undefined);
        (0, node_assert_1.default)(fired < hook.unexpected);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.FrankfurterSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.Currency().list({ "provider": 1 }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.FRANKFURTER_TEST_LIVE;
        for (const op of ['list', 'load']) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'currency.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": { "end_date": { "a": true, "fo": "date", "h": "End Date", "n": "end_date", "r": false, "sh": "Latest publication coverage date; use /coverage for queryable pairs", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "end_date", "index$": 0 }, "id": { "a": true, "h": "Id", "n": "id", "r": false, "t": "`$STRING`", "key$": "id", "index$": 1 }, "iso_code": { "a": true, "h": "Iso Code", "n": "iso_code", "r": true, "sh": "Currency or accounting unit code", "t": "`$STRING`", "key$": "iso_code", "index$": 2 }, "iso_numeric": { "a": true, "h": "Iso Numeric", "n": "iso_numeric", "r": false, "sh": "ISO 4217 numeric code", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "iso_numeric", "index$": 3 }, "name": { "a": true, "h": "Name", "n": "name", "r": true, "sh": "Full currency name", "t": "`$STRING`", "key$": "name", "index$": 4 }, "peg": { "a": true, "h": "Peg", "n": "peg", "r": false, "sh": "Peg metadata, present only for pegged currencies", "t": "`$OBJECT`", "key$": "peg", "index$": 5 }, "providers": { "a": true, "h": "Providers", "n": "providers", "r": false, "sh": "Provider keys that publish this currency", "t": "`$ARRAY`", "key$": "providers", "index$": 6 }, "start_date": { "a": true, "fo": "date", "h": "Start Date", "n": "start_date", "r": false, "sh": "Earliest publication coverage date; use /coverage for queryable pairs", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "start_date", "index$": 7 }, "symbol": { "a": true, "h": "Symbol", "n": "symbol", "r": false, "sh": "Currency symbol", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "symbol", "index$": 8 } }, "id": { "field": "id", "name": "id" }, "name": "currency", "op": { "list": { "input": "data", "name": "list", "points": [{ "a": true, "co": { "id": "GET /currencies", "source": "openapi3", "version": 2 }, "g": { "query": [{ "a": true, "ex": "ECB,TCMB", "k": "query", "n": "provider", "or": "providers", "r": false, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "query", "n": "scope", "or": "scope", "r": false, "t": "`$STRING`", "index$": 1 }] }, "k": "http", "m": "GET", "o": "/currencies", "q": {}, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "currencies" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "list" }, "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /currency/{code}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "ex": "USD", "k": "param", "n": "id", "or": "code", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "GET", "o": "/currency/{code}", "q": { "exist": ["id"] }, "r": { "param": { "code": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "currency" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "load" } }, "relations": { "ancestors": [] }, "key$": "currency", "name__orig": "currency", "Name": "Currency", "name_": "currency", "name-": "currency", "NAME": "CURRENCY", "index$": 1 }, { "active": true, "entity": "currency", "key$": "BasicCurrencyFlow", "kind": "basic", "name": "BasicCurrencyFlow", "param": {}, "step": [{ "a": true, "d": {}, "i": {}, "m": {}, "o": "list", "s": [], "v": [{ "apply": "ItemExists", "def": { "ref": "currency_ref01" } }] }, { "a": true, "d": {}, "i": { "ref": "currency_ref01", "srcdatavar": "currency_ref01_data", "suffix": "_dt0" }, "m": { "id": "currency01" }, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-currency_ref01" } }] }] }, 'Currency', { "GET /currencies": { "protocol": "http", "parameters": [{ "name": "scope", "in": "query", "description": "Set to 'all' to include legacy currencies. Omit for the default list. Other values, including an empty string, return 422.", "required": false, "schema": { "type": "string", "enum": ["all"] }, "index$": 0 }, { "name": "providers", "in": "query", "description": "Comma-separated list of data providers to include. A single provider includes its stored non-currency series. Selecting multiple providers blends only registered currencies and accounting units.", "required": false, "schema": { "type": "string", "example": "ECB,TCMB" }, "x-ref": "#/components/parameters/providers", "index$": 1 }] }, "GET /currency/{code}": { "protocol": "http", "parameters": [{ "name": "code", "in": "path", "required": true, "schema": { "type": "string", "example": "USD" }, "index$": 0 }] } }, { strict: LIVE_STRICT, t });
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        let currency_ref01_data = Object.values(setup.data.existing.currency)[0];
        // LIST
        const currency_ref01_ent = client.Currency();
        const currency_ref01_match = {};
        const currency_ref01_list = (await currency_ref01_ent.list(currency_ref01_match)).map((e) => e.data());
        // LOAD
        const currency_ref01_match_dt0 = {};
        currency_ref01_match_dt0.id = currency_ref01_data.id;
        const currency_ref01_data_dt0 = (await currency_ref01_ent.load(currency_ref01_match_dt0)).data();
        (0, node_assert_1.default)(currency_ref01_data_dt0.id === currency_ref01_data.id);
    });
});
// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true;
function basicSetup(extra) {
    // TODO: fix test def options
    const options = {}; // null
    // TODO: needs test utility to resolve path
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/currency/CurrencyTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.FrankfurterSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['currency01', 'currency02', 'currency03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    const env = (0, utility_1.envOverride)({
        'FRANKFURTER_TEST_CURRENCY_ENTID': idmap,
        'FRANKFURTER_TEST_LIVE': 'FALSE',
        'FRANKFURTER_TEST_EXPLAIN': 'FALSE',
    });
    idmap = env['FRANKFURTER_TEST_CURRENCY_ENTID'];
    const live = 'TRUE' === env.FRANKFURTER_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['FRANKFURTER_TEST_CURRENCY_ENTID'];
        idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {};
        if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
            throw new Error('Live ENTID must be a JSON object');
        }
        client = new __1.FrankfurterSDK(merge([
            // FIRST, so the generated fields below win: sdk-test-control.json's
            // test.client.options adds to the live client, it does not redirect it.
            (0, utility_1.liveClientOptions)(),
            {},
            // 'extra || {}', not a bare 'extra': struct.merge returns UNDEFINED when the
            // last entry is undefined, and basicSetup is normally called with no
            // argument at all - so a bare 'extra' silently discarded the apikey
            // and server values above and handed the SDK undefined. Harmless
            // while there was nothing in that object; not harmless now.
            extra || {},
            { system: { fetch: transport.fetch } }
        ]));
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
    };
    return setup;
}
//# sourceMappingURL=CurrencyEntity.test.js.map