import test from './spec/wrap';
import repo from './spec/connect';
import {TestCollection} from './spec/TestCollection';
import {ChildFragment, TestDocument} from './spec/TestDocument';
import {TestBase} from "./spec/TestBase";
import {MetadataStore} from "./metadata/store";
import {TestExtend} from "./spec/TestExtend";
import {Events} from "./collection";
import {ObjectID, Long} from "./schema";
import {PRIMARY_KEY_NAME} from "./document";

test('Schema', async (t) => {
    const collection = repo('schema-test').get(TestCollection);
    const document = collection.factory({
        name: 'foo',
        defaults: {min: 100, max: 200},
        children: [{min: 1, max: 2}],
        someId: "555330303030303331323132"
    });

    document.children.push({min: 3, max: 4});
    document.listOfNumbers.push(4);

    t.equal(document.toObject().sum, document.listOfNumbers.reduce((l,r) => l+r), 'A @virtual getter should export sum property by toObject()');
    t.ok(document.someId instanceof ObjectID, 'TestDocument.someId should be ObjectID');
    t.ok(document instanceof TestDocument, 'TestCollection.factory() should return instance of the TestDocument class');
    t.ok(typeof document.number === 'number', 'TestDocument.number should be a number');
    t.ok(document.defaults instanceof ChildFragment, 'TestDocument.defaults should be ChildFragment');
    t.same(document.defaults.toObject(), {min: 100, max: 200}, 'TestDocument.defaults should match');
    t.equals(document.name, 'foo', 'TestDocument.name should match');
    t.equals(document.optional, undefined, 'TestDocument.optional should match');
    t.ok(document.children.filter(x => x instanceof ChildFragment), 'TestDocument.children should be ChildFragment[]');
    t.same(document.children.toArray(), [{min: 1, max: 2}, {min: 3, max: 4}], 'TestDocument.children should match');
    t.same(document.listOfNumbers.toArray(), [1, 2, 3, 4], 'TestDocument.listOfNumbers should match');
    t.equals(document.version, 0, 'TestDocument.version should match');
    t.same(document.any, {}, 'TestDocument.any should match');
    t.equals(document.sum, 10, 'TestDocument.sum should match');
    t.equals(document.deep.bar.baz, 'hello', 'TestDocument.deep.bar.baz should match');
    t.equals(document.toJSON().date.toString(), document.date.toString(), 'TestDocument schema should serialize date to string');
    t.ok(document.long instanceof Long, 'TestDocument.long should be Long');

    await document.call(Events.beforeInsert, collection);
    t.equals(document.version, 1, 'TestDocument.version should be increased by beforeInsert hook');
    t.ok(typeof document.autoIncrement === 'number', 'TestDocument.autoIncrement should be number');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Schema extending', async assert => {
    const base = MetadataStore.getSchemaMetadata(TestBase);
    const extended = Object.assign({},
        ...[...MetadataStore.getSchemaMetadata(TestExtend)].map(([key, schema]) => ({[key]: schema}))
    );

    let matches = Object.keys(new TestBase).filter(x => x !== PRIMARY_KEY_NAME).length;
    for (const [key, schema] of base) {
        matches--;
        assert.same(schema, extended[key], `A schema key ${key} should exists in extended document`);
    }

    assert.equal(matches, 0, 'TestExtend should extend any TestBase properties.');
});

test('Document', async assert => {
    const collection = repo('schema-test').get(TestCollection);
    const data = {
        name: 'clone',
        number: Math.random(),
        date: new Date(),
        long: Long.fromNumber(Math.round(Math.random() * 1000))
    };

    const document = collection.factory(Object.assign({}, data, {_id: '555330303030303331323132'}));
    const documentClean = collection.factory(Object.assign({}, data));

    assert.notEqual(document.clone(), document, 'Clone should be clean object');
    assert.ok(document.clone() instanceof TestDocument, 'Clone should be TestDocument');
    assert.same(document.clone().toObject(), documentClean.toObject(), 'Document should clone');

    await collection.drop();
    return (await collection.connection).disconnect();
});
