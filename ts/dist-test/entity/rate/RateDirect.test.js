"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const live_runner_1 = require("../../live-runner");
const __1 = require("../../..");
const utility_1 = require("../../utility");
(0, utility_1.loadEnvLocal)(__dirname + '/../../../.env.local');
(0, node_test_1.describe)('RateDirect', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when FRANKFURTER_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('FRANKFURTER_TEST_LIVE'));
    (0, node_test_1.test)('direct-exists', async () => {
        const sdk = new __1.FrankfurterSDK({
            base: 'http://localhost:8080',
            system: { fetch: async () => ({}) }
        });
        (0, node_assert_1.default)('function' === typeof sdk.direct);
        (0, node_assert_1.default)('function' === typeof sdk.prepare);
    });
    (0, node_test_1.test)('direct-load-rate', async (t) => {
        if (liveScenariosActive()) {
            t.skip('Covered by live operation scenarios');
            return;
        }
        const setup = directSetup({ id: 'direct01' });
        if ((0, utility_1.maybeSkipControl)(t, 'direct', 'direct-load-rate', setup.live))
            return;
        const { client, calls } = setup;
        const params = {};
        const query = {};
        if (setup.live) {
            params.base = "EUR";
            params.provider = "ECB";
            params.quote = "USD";
        }
        else {
            params.base = 'direct01';
            params.provider = 'direct02';
            params.quote = 'direct03';
        }
        const result = await client.direct({
            path: 'providers/{provider}/rate/{base}/{quote}',
            method: 'GET',
            params,
            query,
        });
        if (setup.live) {
            if (!result.ok || result.status < 200 || result.status >= 300) {
                return void (0, utility_1.liveMiss)(t, LIVE_STRICT, 'Live load failed: ' + (0, utility_1.describeLive)(result));
            }
            if (!(null != result.data)) {
                return void (0, utility_1.liveMiss)(t, LIVE_STRICT, 'Live load returned no data: ' + (0, utility_1.describeLive)(result));
            }
        }
        else {
            (0, node_assert_1.default)(result.ok === true);
            (0, node_assert_1.default)(result.status === 200);
            (0, node_assert_1.default)(null != result.data);
            (0, node_assert_1.default)(result.data.id === 'direct01');
            (0, node_assert_1.default)(calls.length === 1);
            (0, node_assert_1.default)(calls[0].init.method === 'GET');
            (0, node_assert_1.default)(calls[0].url.includes('direct01'));
            (0, node_assert_1.default)(calls[0].url.includes('direct02'));
            (0, node_assert_1.default)(calls[0].url.includes('direct03'));
        }
    });
    (0, node_test_1.test)('direct-list-rate', async (t) => {
        if (liveScenariosActive()) {
            t.skip('Covered by live operation scenarios');
            return;
        }
        const setup = directSetup([{ id: 'direct01' }, { id: 'direct02' }]);
        if ((0, utility_1.maybeSkipControl)(t, 'direct', 'direct-list-rate', setup.live))
            return;
        if ((0, utility_1.skipIfMissingIds)(t, setup, ["provider01"], LIVE_STRICT))
            return;
        const { client, calls } = setup;
        const params = {};
        const query = {};
        if (setup.live) {
            params.provider = setup.idmap['provider01'];
        }
        else {
            params.provider = 'direct01';
        }
        const result = await client.direct({
            path: 'providers/{provider}/rates',
            method: 'GET',
            params,
            query,
        });
        if (setup.live) {
            if (!result.ok || result.status < 200 || result.status >= 300) {
                return void (0, utility_1.liveMiss)(t, LIVE_STRICT, 'Live list failed: ' + (0, utility_1.describeLive)(result));
            }
            if (!(Array.isArray(unwrapListData(result.data)))) {
                return void (0, utility_1.liveMiss)(t, LIVE_STRICT, 'Live list returned no list: ' + (0, utility_1.describeLive)(result));
            }
        }
        else {
            (0, node_assert_1.default)(result.ok === true);
            (0, node_assert_1.default)(result.status === 200);
            (0, node_assert_1.default)(null != result.data);
            const listArr = unwrapListData(result.data);
            (0, node_assert_1.default)(Array.isArray(listArr));
            (0, node_assert_1.default)(listArr.length === 2);
            (0, node_assert_1.default)(calls.length === 1);
            (0, node_assert_1.default)(calls[0].init.method === 'GET');
            (0, node_assert_1.default)(calls[0].url.includes('direct01'));
        }
    });
});
// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true;
function liveScenariosActive() { return false && process.env.FRANKFURTER_TEST_LIVE === 'TRUE'; }
function directSetup(mockres) {
    const calls = [];
    const env = (0, utility_1.envOverride)({
        'FRANKFURTER_TEST_RATE_ENTID': {},
        'FRANKFURTER_TEST_LIVE': 'FALSE',
    });
    const live = 'TRUE' === env.FRANKFURTER_TEST_LIVE;
    if (live) {
        const transport = (0, live_runner_1.createLiveTransport)();
        // Merged so the generated fields win: sdk-test-control.json's
        // test.client.options adds to the live client, it does not redirect it.
        const client = new __1.FrankfurterSDK(Object.assign({}, (0, utility_1.liveClientOptions)(), { system: { fetch: transport.fetch },
        }));
        let idmap = env['FRANKFURTER_TEST_RATE_ENTID'];
        if ('string' === typeof idmap && idmap.startsWith('{')) {
            idmap = JSON.parse(idmap);
        }
        return { client, calls, live, idmap, transport };
    }
    const mockFetch = async (url, init) => {
        calls.push({ url, init });
        return {
            status: 200,
            statusText: 'OK',
            headers: {},
            json: async () => (null != mockres ? mockres : { id: 'direct01' }),
        };
    };
    const client = new __1.FrankfurterSDK({
        base: 'http://localhost:8080',
        system: { fetch: mockFetch },
    });
    return { client, calls, live, idmap: {} };
}
// direct() returns the raw response body. List endpoints often wrap the
// array in an envelope (e.g. { data: [...] }, { entities: [...] },
// { pagination, data: [...] }). The test transforms the raw body to
// extract the first array — either the body itself or the first array
// property of an envelope object.
function unwrapListData(data) {
    if (Array.isArray(data))
        return data;
    if (data && 'object' === typeof data) {
        for (const v of Object.values(data)) {
            if (Array.isArray(v))
                return v;
        }
    }
    return null;
}
//# sourceMappingURL=RateDirect.test.js.map