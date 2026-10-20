"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_util_1 = require("node:util");
const node_test_1 = require("node:test");
const __1 = require("..");
const Control_1 = require("../dist/Control");
const Point_1 = require("../dist/Point");
const Response_1 = require("../dist/Response");
const BaseFeature_1 = require("../dist/feature/base/BaseFeature");
const GraphqlUtility_1 = require("../dist/utility/GraphqlUtility");
const MediaUtility_1 = require("../dist/utility/MediaUtility");
const PrepareHeadersUtility_1 = require("../dist/utility/PrepareHeadersUtility");
const PrepareHeadersUtility_2 = require("../dist/utility/PrepareHeadersUtility");
const PrepareQueryUtility_1 = require("../dist/utility/PrepareQueryUtility");
const TransformRequestUtility_1 = require("../dist/utility/TransformRequestUtility");
(0, node_test_1.test)('public runtime value objects preserve their inputs and defaults', async () => {
    const signal = new AbortController().signal;
    const control = new Control_1.Control({ throw: false, err: 'err', explain: {}, signal });
    strict_1.default.equal(control.throw, false);
    strict_1.default.equal(control.err, 'err');
    strict_1.default.equal(control.signal, signal);
    const point = new Point_1.Point({ method: 'GET', orig: '/currencies', active: false });
    strict_1.default.equal(point.method, 'GET');
    strict_1.default.equal(point.orig, '/currencies');
    strict_1.default.equal(point.active, false);
    strict_1.default.deepEqual(point.parts, []);
    const empty = new Response_1.Response({ status: 204, text: async () => '' });
    strict_1.default.equal(await empty.json(), undefined);
    const parsed = new Response_1.Response({ status: 200, text: async () => '{"ok":true}' });
    strict_1.default.deepEqual(await parsed.json(), { ok: true });
    const invalid = new Response_1.Response({ status: 500, text: async () => 'not-json' });
    await strict_1.default.rejects(invalid.json(), /Unexpected token|Unexpected character/);
});
(0, node_test_1.test)('entity helper methods expose safe copies and lifecycle state', () => {
    const client = __1.FrankfurterSDK.test();
    const entity = client.Coverage({ active: true });
    entity.data({ base: 'EUR', start_date: null, end_date: null,
        providers: null, quotes: null });
    entity.match({ base: 'EUR' });
    strict_1.default.equal(entity.client(), client);
    strict_1.default.deepEqual(entity.entopts(), { active: true });
    strict_1.default.equal(entity.data().base, 'EUR');
    strict_1.default.equal(entity.match().base, 'EUR');
    strict_1.default.notEqual(entity.make(), entity);
    strict_1.default.equal(entity.deleted(), false);
    entity.markDeleted();
    strict_1.default.equal(entity.deleted(), true);
    strict_1.default.equal(entity.toJSON()['voxgig$entity'], 'Coverage');
    strict_1.default.match(entity.toString(), /^Coverage /);
    strict_1.default.equal(entity[node_util_1.inspect.custom](), entity.toString());
    strict_1.default.deepEqual(client.toJSON(), { name: 'Frankfurter' });
    (0, strict_1.default)(client.tester() instanceof __1.FrankfurterSDK);
});
(0, node_test_1.test)('base feature hooks and abort helper implement their no-op contract', async () => {
    const feature = new BaseFeature_1.BaseFeature();
    const ctx = {};
    await feature.init(ctx, {});
    for (const name of ['PostConstruct', 'PostConstructEntity', 'SetData', 'GetData',
        'SetMatch', 'GetMatch', 'PrePoint', 'PreSpec', 'PreRequest', 'PreResponse',
        'PreResult', 'PreDone', 'PreUnexpected']) {
        strict_1.default.equal(feature[name](ctx), undefined);
    }
    strict_1.default.equal(await feature._untilAbort(Promise.resolve('done')), 'done');
    const controller = new AbortController();
    controller.abort(new Error('stopped'));
    await strict_1.default.rejects(feature._untilAbort(Promise.resolve('unused'), controller.signal), /stopped/);
});
(0, node_test_1.test)('media helpers cover JSON, raw bodies, streams, and cookie filtering', async () => {
    strict_1.default.equal((0, MediaUtility_1.isJsonMedia)('application/problem+json; charset=utf-8'), true);
    strict_1.default.equal((0, MediaUtility_1.isJsonMedia)('text/plain'), false);
    strict_1.default.equal((0, MediaUtility_1.acceptOf)({ response: { kind: 'json', media: 'application/json' } }), 'application/json');
    strict_1.default.equal((0, MediaUtility_1.isJsonRequest)({ body: { kind: 'json' } }), true);
    strict_1.default.equal((0, MediaUtility_1.isRawRequest)({ body: { kind: 'raw' } }), true);
    strict_1.default.deepEqual((0, MediaUtility_1.mediaHeaders)({ response: { kind: 'json', media: 'application/json' } }, {}), { accept: 'application/json' });
    strict_1.default.equal((0, MediaUtility_1.rawBody)({ '$body': 'payload' }), 'payload');
    strict_1.default.deepEqual((0, PrepareHeadersUtility_1.cookieKeep)('keep=1; drop=2', ['drop']), ['keep=1']);
    async function* chunks() { yield 'ab'; yield new Uint8Array([99]); }
    const stream = chunks();
    strict_1.default.equal((0, MediaUtility_1.isStream)(stream), true);
    strict_1.default.equal((0, MediaUtility_1.isRawValue)(stream), true);
    const bytes = await (0, MediaUtility_1.readStream)(stream);
    strict_1.default.equal(new TextDecoder().decode(bytes), 'abc');
    const webStream = new ReadableStream({
        start(controller) {
            controller.enqueue(new Uint8Array([100]));
            controller.close();
        },
    });
    strict_1.default.equal(new TextDecoder().decode(await (0, MediaUtility_1.readStream)(webStream)), 'd');
    strict_1.default.equal((0, MediaUtility_1.isRawValue)(new ArrayBuffer(1)), true);
    strict_1.default.equal((0, MediaUtility_1.isRawValue)(new Blob(['x'])), true);
    strict_1.default.equal((0, MediaUtility_1.acceptOf)({ response: { kind: 'raw', media: 'text/csv',
            alternatives: [{ media: 'application/x-ndjson' }] } }), 'text/csv, application/x-ndjson');
});
(0, node_test_1.test)('request routing helpers serialize headers, cookies, query, and body independently', () => {
    const client = new __1.FrankfurterSDK({
        headers: { Cookie: 'keep=1; drop=old', 'X-Token': 'old' },
    });
    const utility = client.utility();
    const point = {
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
        transform: { req: (ctx) => ({
                body: ctx.reqdata.body,
                '$action': ctx.reqdata['$action'],
            }) },
    };
    const ctx = {
        client,
        utility,
        point,
        reqmatch: { token: 'new', drop: 'fresh', prefs: ['a b', 'c'],
            base: 'EUR', code: 'USD', extra: 'kept' },
        reqdata: { routed: 'remove', body: 'kept', '$action': 'ignored' },
        match: {},
        data: {},
        spec: {},
    };
    strict_1.default.deepEqual((0, PrepareHeadersUtility_2.prepareHeaders)(ctx), {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-token': 'new',
        cookie: 'keep=1; drop=fresh; prefs=a%20b; prefs=c',
    });
    strict_1.default.deepEqual((0, PrepareQueryUtility_1.prepareQuery)(ctx), {
        base_currency: 'EUR',
        extra: 'kept',
    });
    strict_1.default.deepEqual((0, TransformRequestUtility_1.transformRequest)(ctx), { body: 'kept' });
    point.args.cookie = [{ name: 'cookieMap', orig: 'unused' }];
    ctx.reqmatch = { cookieMap: { theme: 'dark mode', compact: true } };
    strict_1.default.equal((0, PrepareHeadersUtility_2.prepareHeaders)(ctx).cookie, 'keep=1; drop=old; compact=true; theme=dark%20mode');
});
(0, node_test_1.test)('Response supports native json readers and absent readers', async () => {
    const value = { ok: true };
    const native = new Response_1.Response({ status: 200, json() { return value; } });
    strict_1.default.equal(await native.json(), value);
    const missing = new Response_1.Response({ status: 204 });
    strict_1.default.equal(await missing.json(), undefined);
});
(0, node_test_1.test)('GraphQL helpers remain deterministic even for this REST API', () => {
    strict_1.default.equal((0, GraphqlUtility_1.graphqlErrorCode)({ extensions: { code: 'UNAUTHENTICATED' } }), 'request_auth');
    strict_1.default.equal((0, GraphqlUtility_1.graphqlErrorCode)({ extensions: { type: 'RATE_LIMITED' } }), 'request_ratelimit');
    strict_1.default.equal((0, GraphqlUtility_1.graphqlErrorCode)({ extensions: { code: 'BAD_USER_INPUT' } }), 'request_invalid');
    strict_1.default.equal((0, GraphqlUtility_1.graphqlErrorCode)({}), 'request_graphql');
    const client = new __1.FrankfurterSDK();
    const ctx = {
        utility: client.utility(),
        point: { kind: 'graphql', graphql: { doc: 'query Q($code: String!) { q }',
                vars: [{ name: 'code', from: 'code' }] } },
        op: { input: 'data' },
        reqdata: { code: 'USD' },
        data: {},
    };
    strict_1.default.deepEqual((0, GraphqlUtility_1.graphqlBody)(ctx), {
        query: 'query Q($code: String!) { q }', variables: { code: 'USD' },
    });
    ctx.result = { ok: true, body: { errors: [{ message: 'bad input',
                    extensions: { code: 'BAD_USER_INPUT' } }] } };
    ctx.error = (code, message) => Object.assign(new Error(message), { code });
    strict_1.default.equal((0, GraphqlUtility_1.graphqlErrors)(ctx), true);
    strict_1.default.equal(ctx.result.ok, false);
    strict_1.default.equal(ctx.result.err.code, 'request_invalid');
});
//# sourceMappingURL=quality.test.js.map