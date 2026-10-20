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
(0, node_test_1.describe)('ProviderEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when FRANKFURTER_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('FRANKFURTER_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.FrankfurterSDK.test();
        const ent = testsdk.Provider();
        (0, node_assert_1.default)(null != ent);
    });
    class FailHook extends __1.BaseFeature {
        name = 'failhook';
        version = '0.0.1';
        active = true;
        unexpected = 0;
        init() { }
        PreSpec() { throw new Error('provider hook failed'); }
        PreUnexpected() { this.unexpected++; }
    }
    (0, node_test_1.test)('stream-error', async () => {
        const offline = { net: { offline: true } };
        await node_assert_1.default.rejects(async () => {
            for await (const _item of __1.FrankfurterSDK.test(offline).Provider().stream('list')) { }
        }, /offline/);
        for await (const _item of __1.FrankfurterSDK.test(offline).Provider()
            .stream('list', undefined, { ctrl: { throw: false } })) { }
        if (null != __1.config.feature?.rbac) {
            const denied = __1.FrankfurterSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } });
            await node_assert_1.default.rejects(async () => {
                for await (const _item of denied.Provider().stream('list')) { }
            }, (err) => 'rbac_denied' === err.code);
        }
    });
    (0, node_test_1.test)('stream-ctrl', async () => {
        const explain = {};
        const ctrl = { explain };
        for await (const _item of __1.FrankfurterSDK.test().Provider().stream('list', undefined, { ctrl })) { }
        node_assert_1.default.deepStrictEqual(Object.keys(ctrl), ['explain']);
        (0, node_assert_1.default)(explain === ctrl.explain && 0 < Object.keys(explain).length);
    });
    (0, node_test_1.test)('unexpected', async () => {
        const hook = new FailHook();
        const client = new __1.FrankfurterSDK({ feature: { test: { active: true } }, extend: [hook] });
        await node_assert_1.default.rejects(client.Provider().list(), /hook failed/);
        (0, node_assert_1.default)(0 < hook.unexpected);
        const fired = hook.unexpected;
        node_assert_1.default.strictEqual(await client.Provider().list(undefined, { throw: false }), undefined);
        (0, node_assert_1.default)(fired < hook.unexpected);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.FrankfurterSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.Provider().list({ "country_code": 1 }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.FRANKFURTER_TEST_LIVE;
        for (const op of ['list', 'load']) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'provider.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": { "country_code": { "a": true, "h": "Country Code", "n": "country_code", "r": false, "sh": "ISO 3166-1 alpha-2 country code", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "country_code", "index$": 0 }, "currencies": { "a": true, "h": "Currencies", "n": "currencies", "r": true, "sh": "Recognised currency codes within their valid date ranges covered by this provider", "t": "`$ARRAY`", "key$": "currencies", "index$": 1 }, "data_url": { "a": true, "fo": "uri", "h": "Data Url", "n": "data_url", "r": false, "sh": "Link to the data source", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "data_url", "index$": 2 }, "end_date": { "a": true, "fo": "date", "h": "End Date", "n": "end_date", "r": false, "sh": "Latest publication coverage date; use /coverage for queryable pairs", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "end_date", "index$": 3 }, "frequency": { "a": true, "h": "Frequency", "n": "frequency", "r": false, "sh": "The period each observation stands for, after SDMX FREQ.", "t": "`$STRING`", "key$": "frequency", "index$": 4 }, "id": { "a": true, "h": "Id", "n": "id", "r": false, "t": "`$STRING`", "key$": "id", "index$": 5 }, "key": { "a": true, "h": "Key", "n": "key", "r": true, "sh": "Provider identifier", "t": "`$STRING`", "key$": "key", "index$": 6 }, "name": { "a": true, "h": "Name", "n": "name", "r": true, "sh": "Full provider name", "t": "`$STRING`", "key$": "name", "index$": 7 }, "pivot_currency": { "a": true, "h": "Pivot Currency", "n": "pivot_currency", "r": false, "sh": "Base currency for published rates", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "pivot_currency", "index$": 8 }, "publish_cadence": { "a": true, "h": "Publish Cadence", "n": "publish_cadence", "r": false, "sh": "How often the provider publishes rates.", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "publish_cadence", "index$": 9 }, "publishes_missed": { "a": true, "h": "Publishes Missed", "n": "publishes_missed", "r": false, "sh": "Number of expected publishes missed since end_date, in units of publish_cadence.", "t": ["`$ONE`", ["`$INTEGER`", "`$NULL`"]], "key$": "publishes_missed", "index$": 10 }, "rate_type": { "a": true, "h": "Rate Type", "n": "rate_type", "r": false, "sh": "Official rate type as used by the source", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "rate_type", "index$": 11 }, "start_date": { "a": true, "fo": "date", "h": "Start Date", "n": "start_date", "r": false, "sh": "Earliest publication coverage date; use /coverage for queryable pairs", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "start_date", "index$": 12 }, "terms_url": { "a": true, "fo": "uri", "h": "Terms Url", "n": "terms_url", "r": false, "sh": "Link to terms of use", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "terms_url", "index$": 13 }, "unknown_currencies": { "a": true, "h": "Unknown Currencies", "n": "unknown_currencies", "r": false, "sh": "Unreviewed published codes absent from the currency registry.", "t": "`$ARRAY`", "key$": "unknown_currencies", "index$": 14 } }, "id": { "field": "id", "name": "id" }, "name": "provider", "op": { "list": { "input": "data", "name": "list", "points": [{ "a": true, "co": { "id": "GET /providers", "source": "openapi3", "version": 2 }, "g": {}, "k": "http", "m": "GET", "o": "/providers", "q": {}, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "providers" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "list" }, "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /providers/{provider}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "ex": "ECB", "k": "param", "n": "id", "or": "provider", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "GET", "o": "/providers/{provider}", "q": { "exist": ["id"] }, "r": { "param": { "provider": "id" } }, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "providers" }, { "var": "id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "load" } }, "relations": { "ancestors": [] }, "key$": "provider", "name__orig": "provider", "Name": "Provider", "name_": "provider", "name-": "provider", "NAME": "PROVIDER", "index$": 2 }, { "active": true, "entity": "provider", "key$": "BasicProviderFlow", "kind": "basic", "name": "BasicProviderFlow", "param": {}, "step": [{ "a": true, "d": {}, "i": {}, "m": {}, "o": "list", "s": [], "v": [{ "apply": "ItemExists", "def": { "ref": "provider_ref01" } }] }, { "a": true, "d": {}, "i": { "ref": "provider_ref01", "srcdatavar": "provider_ref01_data", "suffix": "_dt0" }, "m": { "id": "provider01" }, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-provider_ref01" } }] }] }, 'Provider', { "GET /providers": { "protocol": "http", "parameters": [] }, "GET /providers/{provider}": { "protocol": "http", "parameters": [{ "name": "provider", "in": "path", "required": true, "description": "Provider key, case-insensitive. See `/providers` for the list.", "schema": { "type": "string", "example": "ECB" }, "index$": 0 }] } }, { strict: LIVE_STRICT, t });
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        let provider_ref01_data = Object.values(setup.data.existing.provider)[0];
        // LIST
        const provider_ref01_ent = client.Provider();
        const provider_ref01_match = {};
        const provider_ref01_list = (await provider_ref01_ent.list(provider_ref01_match)).map((e) => e.data());
        // LOAD
        const provider_ref01_match_dt0 = {};
        provider_ref01_match_dt0.id = provider_ref01_data.id;
        const provider_ref01_data_dt0 = (await provider_ref01_ent.load(provider_ref01_match_dt0)).data();
        (0, node_assert_1.default)(provider_ref01_data_dt0.id === provider_ref01_data.id);
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
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/provider/ProviderTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.FrankfurterSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['provider01', 'provider02', 'provider03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    const env = (0, utility_1.envOverride)({
        'FRANKFURTER_TEST_PROVIDER_ENTID': idmap,
        'FRANKFURTER_TEST_LIVE': 'FALSE',
        'FRANKFURTER_TEST_EXPLAIN': 'FALSE',
    });
    idmap = env['FRANKFURTER_TEST_PROVIDER_ENTID'];
    const live = 'TRUE' === env.FRANKFURTER_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['FRANKFURTER_TEST_PROVIDER_ENTID'];
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
//# sourceMappingURL=ProviderEntity.test.js.map