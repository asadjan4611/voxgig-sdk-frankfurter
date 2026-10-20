"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const __1 = require("..");
(0, node_test_1.test)('live invalid currency returns a client error', { skip: process.env.FRANKFURTER_TEST_LIVE !== 'TRUE' }, async () => {
    const result = await new __1.SDK().direct({
        path: '/currency/{code}',
        method: 'GET',
        params: { code: 'NOT_A_CURRENCY' },
    });
    strict_1.default.equal(result.ok, false);
    strict_1.default.equal(typeof result.status, 'number');
    (0, strict_1.default)((result.status ?? 0) >= 400 && (result.status ?? 0) < 500);
});
//# sourceMappingURL=live-errors.test.js.map