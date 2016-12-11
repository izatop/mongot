"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const wrap_1 = require("./spec/wrap");
const connect_1 = require("./spec/connect");
const TestCollection_1 = require("./spec/TestCollection");
const TestDocument_1 = require("./spec/TestDocument");
wrap_1.default('Schema', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const document = collection.factory({
        name: 'foo',
        defaults: { min: 100, max: 200 },
        children: [{ min: 1, max: 2 }]
    });
    document.children.push({ min: 3, max: 4 });
    document.listOfNumbers.push(4);
    t.ok(document instanceof TestDocument_1.TestDocument, 'TestCollection.factory() should return instance of the TestDocument class');
    t.ok(typeof document.number === 'number', 'TestDocument.number should be a number');
    t.ok(document.defaults instanceof TestDocument_1.ChildFragment, 'TestDocument.defaults should be ChildFragment');
    t.same(document.defaults.toObject(), { min: 100, max: 200 }, 'TestDocument.defaults should match');
    t.equals(document.name, 'foo', 'TestDocument.name should match');
    t.equals(document.optional, undefined, 'TestDocument.optional should match');
    t.ok(document.children.filter(x => x instanceof TestDocument_1.ChildFragment), 'TestDocument.children should be ChildFragment[]');
    t.same(document.children.toArray(), [{ min: 1, max: 2 }, { min: 3, max: 4 }], 'TestDocument.children should match');
    t.same(document.listOfNumbers.toArray(), [1, 2, 3, 4], 'TestDocument.listOfNumbers should match');
    t.equals(document.version, 0, 'TestDocument.version should match');
    t.same(document.any, {}, 'TestDocument.any should match');
    t.equals(document.sum, 10, 'TestDocument.sum should match');
    t.equals(document.deep.bar.baz, 'hello', 'TestDocument.deep.bar.baz should match');
    t.equals(document.toJSON().date.toString(), document.date.toString(), 'TestDocument schema should serialize date to string');
    document.getEventListener().emit('beforeInsert', []);
    t.equals(document.version, 1, 'TestDocument.version should be increased by beforeInsert hook');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
//# sourceMappingURL=schema.spec.js.map