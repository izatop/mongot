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
const wrap_1 = require("./spec/wrap");
const connect_1 = require("./spec/connect");
const TestCollection_1 = require("./spec/TestCollection");
const TestDocument_1 = require("./spec/TestDocument");
const TestBase_1 = require("./spec/TestBase");
const store_1 = require("./metadata/store");
const TestExtend_1 = require("./spec/TestExtend");
const collection_1 = require("./collection");
const schema_1 = require("./schema");
const document_1 = require("./document");
wrap_1.default('Schema', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default('schema-test').get(TestCollection_1.TestCollection);
    const document = collection.factory({
        name: 'foo',
        defaults: { min: 100, max: 200 },
        children: [{ min: 1, max: 2 }],
        someId: "555330303030303331323132"
    });
    document.children.push({ min: 3, max: 4 });
    document.listOfNumbers.push(4);
    t.equal(document.toObject().sum, document.listOfNumbers.reduce((l, r) => l + r), 'A @virtual getter should export sum property by toObject()');
    t.ok(document.someId instanceof schema_1.ObjectID, 'TestDocument.someId should be ObjectID');
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
    t.ok(document.long instanceof schema_1.Long, 'TestDocument.long should be Long');
    yield document.call(collection_1.Events.beforeInsert, collection);
    t.equals(document.version, 1, 'TestDocument.version should be increased by beforeInsert hook');
    t.ok(typeof document.autoIncrement === 'number', 'TestDocument.autoIncrement should be number');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Schema extending', (assert) => __awaiter(this, void 0, void 0, function* () {
    const base = store_1.MetadataStore.getSchemaMetadata(TestBase_1.TestBase);
    const extended = Object.assign({}, ...[...store_1.MetadataStore.getSchemaMetadata(TestExtend_1.TestExtend)].map(([key, schema]) => ({ [key]: schema })));
    let matches = Object.keys(new TestBase_1.TestBase).filter(x => x !== document_1.PRIMARY_KEY_NAME).length;
    for (const [key, schema] of base) {
        matches--;
        assert.same(schema, extended[key], `A schema key ${key} should exists in extended document`);
    }
    assert.equal(matches, 0, 'TestExtend should extend any TestBase properties.');
}));
wrap_1.default('Document', (assert) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default('schema-test').get(TestCollection_1.TestCollection);
    const data = {
        name: 'clone',
        number: Math.random(),
        date: new Date(),
        long: schema_1.Long.fromNumber(Math.round(Math.random() * 1000))
    };
    const document = collection.factory(Object.assign({}, data, { _id: '555330303030303331323132' }));
    const documentClean = collection.factory(Object.assign({}, data));
    assert.notEqual(document.clone(), document, 'Clone should be clean object');
    assert.ok(document.clone() instanceof TestDocument_1.TestDocument, 'Clone should be TestDocument');
    assert.same(document.clone().toObject(), documentClean.toObject(), 'Document should clone');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
//# sourceMappingURL=schema.spec.js.map