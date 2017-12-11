"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const MongoDb = require("mongodb");
const connection_1 = require("./connection");
test('Connection', (t) => __awaiter(this, void 0, void 0, function* () {
    const conn = yield connection_1.Connection.connect(null, 'mongodb://localhost/test?');
    const foo = yield conn.get('foo');
    t.ok(conn.db instanceof MongoDb.Db, 'conn.db should be instance of MongoDb.Db');
    t.same(foo.namespace, 'test.foo', 'foo.namespace should be `test.foo`');
    yield conn.disconnect();
    t.end();
}));
//# sourceMappingURL=connection.spec.js.map