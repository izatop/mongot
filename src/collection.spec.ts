import test from './spec/wrap';
import repo from './spec/connect';
import {Cursor} from "./cursor";
import {TestCollection} from "./spec/TestCollection";
import {InsertResult, DeleteResult, UpdateResult} from "./collection/helpers";
import {TestDocument} from "./spec/TestDocument";
import {PartialDocumentFragment} from "./document";
import {ObjectID} from "./schema";

function setupMany(collection: TestCollection, documents: Array<TestDocument>, raw?: Object[]) {
    const data: Object[] = raw || ['foo', 'bar', 'baz'].map(name => ({name}));
    data.map(x => collection.factory(x))
        .forEach(x => documents.push(x));

    return collection.insertMany(documents);
}

test('Collection.find()', async (t) => {
    const collection = repo().get(TestCollection);
    const result = await collection.find({});

    t.ok(result instanceof Cursor, 'TestCollection.find({}) should return Promise<Cursor>');
    t.ok(result.cursor, 'A result should have an original cursor');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.find().fetchAll()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents = [];
    const foos = [];
    for (let i = 0; i < 100; i++) {
        foos.push({name: "foo" + i.toString()});
    }

    await setupMany(collection, documents, foos);
    const cursor = await collection.find({});
    const result = await cursor.fetchAll();
    t.equal(result.length, 100, 'result.fetchAll() should return 100 documents');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.findOne(query)', async (t) => {
    const collection = repo().get(TestCollection);
    const documents = [];
    const foos = [];
    for (let i = 0; i < 10; i++) {
        foos.push({name: "foo" + i.toString()});
    }

    await setupMany(collection, documents, foos);

    const index = Math.round(Math.random() * documents.length - 1);
    const query = {_id: documents[index]._id.toHexString()};
    const queryMulti = {_id: {$in: documents.map(x => x._id.toHexString())}};
    const doc = await collection.findOne(query);
    const docs = await collection.find(queryMulti);
    t.same(doc._id, documents[index]._id, 'collection.findOne(query) should return valid document');
    t.same((await docs.fetchAll()).length, documents.length, 'collection.find(query) should return valid count of documents');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.find().fetch()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents = [];
    const foos = [];
    try {
        for (let i = 0; i < 100; i++) {
            foos.push({name: "foo" + i.toString()});
        }

        await setupMany(collection, documents, foos);
        const cursor = await collection.find({});
        let counter = 0, result;
        do {
            result = await cursor.fetch();
            if (result) {
                counter++;
            }
        } while (result);

        t.equal(counter, 100, 'result.fetch() should read 100 records');
    } catch (error) {
        t.fail(error);
    }

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.find().project()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents = [];
    const number = Math.random();
    await setupMany(collection, documents, [{name: 'foo', number, version: 1}]);

    const result = await (await collection.find({})).project({name: 1, number: 1}).fetch();
    t.ok(result instanceof PartialDocumentFragment, 'TestCollection.find({}).project().fetch() should return PartialDocumentFragment instead TestDocument');
    t.same(result.toObject(), {name: 'foo', number, _id: result._id.toString()}, 'PartialDocumentFragment should have custom fields');

    await collection.drop();
    return (await collection.connection).disconnect();
});


test('Collection.insertOne()', async (t) => {
    const collection = repo().get(TestCollection);
    const document = collection.factory({any: {any: false}, name: 'One', someId: "555330303030303331323132"});
    const result = await collection.insertOne(document);
    const inserted = await collection.findOne(result.insertedId);
    t.ok(result instanceof InsertResult, 'collection.insertOne() should return InsertResult');
    t.ok(result.insertedId instanceof ObjectID, 'result.insertedId should be ObjectID');
    t.ok(document.someId instanceof ObjectID, 'TestDocument.someId should be ObjectID');
    t.ok(typeof document.autoIncrement === 'number', 'TestDocument.autoIncrement should be set');
    t.equals(document._id, result.insertedId, 'TestDocument should have insertedId');
    t.equals(document, result.ref, 'result.ref should be TestDocument');
    t.equals(document.version, 1, 'TestDocument.beforeInsert should be fired');
    t.same(document.toObject(), inserted.toObject(), 'TestDocument should be inserted correctly');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.insertMany()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents = [];
    const result = await setupMany(collection, documents);

    t.ok(result.filter(x => x instanceof InsertResult).length === documents.length, 'collection.insertMany() should return InsertResult[]');
    result.forEach(res => {
        t.ok(documents.filter(x => x === res.ref).length === 1, `InsertResult.ref should match original ${res.ref.name}`);
    });

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.deleteMany()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    const result = await setupMany(collection, documents);

    t.equals(result.length, documents.length, 'documents should be inserted');

    const deleteResult = await collection.deleteMany({_id: {$in: documents.map(x => x._id)}});
    t.ok(deleteResult instanceof DeleteResult, 'deleteResult should be DeleteResult');
    t.equals(deleteResult.count, documents.length, 'deleteResult.count should be equals of documents count');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.deleteOne()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    const result = await setupMany(collection, documents);

    t.equals(result.length, documents.length, 'documents should be inserted');

    const deleteResult = await collection.deleteOne({_id: {$in: documents.map(x => x._id)}});
    t.ok(deleteResult instanceof DeleteResult, 'deleteResult should be DeleteResult');
    t.equals(deleteResult.count, 1, 'deleteResult.count should be 1');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.findOneAndUpdate/Replace/Delete()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    await setupMany(collection, documents);

    const findOneAndUpdateUndefinedResult = await collection.findOneAndUpdate({undefinedKey: 'unknown'}, {$set: {name: 'foo2'}});
    const findOneAndUpdateResult = await collection.findOneAndUpdate(documents[0], {$set: {name: 'foo2'}});
    const findOneAndReplaceResult = await collection.findOneAndReplace(documents[1], Object.assign({}, documents[1], {name: 'bar1'}), {returnOriginal: false});
    const findOneAndDeleteResult = await collection.findOneAndDelete(documents[2]);

    t.equal(findOneAndUpdateUndefinedResult.has(), false, 'findOneAndUpdateUndefinedResult.has() should return false');
    t.equal(findOneAndUpdateUndefinedResult.get(), null, 'findOneAndUpdateUndefinedResult.get() should return null');
    t.equal(findOneAndUpdateResult.has(), true, 'findOneAndUpdateResult.has() should return true');
    t.same(findOneAndUpdateResult.get().name, 'foo', 'findOneAndUpdateResult should contain an original document');
    t.equal(findOneAndReplaceResult.has(), true, 'findOneAndReplaceResult.has() should return true');
    t.same(findOneAndReplaceResult.get().name, 'bar1', 'findOneAndReplaceResult should contain a replaced document');
    t.same(findOneAndDeleteResult.get().toObject()._id, documents[2].toObject()._id, 'findOneAndDeleteResult should contain a deleted document');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.find()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    await setupMany(collection, documents);

    const all = await collection.find({_id: {$in: documents.map(x => x._id)}});
    t.ok(all instanceof Cursor, 'collection.find() should return Cursor');
    t.same((await all.fetchAll()).map(x => x.toObject()), documents.map(x => x.toObject()));
    t.equals(await all.rewind().count(), documents.length);

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.findOne()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    await setupMany(collection, documents);

    const document = await collection.findOne(documents[1]._id);
    t.same(document.toObject(), documents[1].toObject(), 'collection.findOne() should return valid document');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.drop()', async (t) => {
    const collection = repo().get(TestCollection);
    await collection.connection;

    await collection.insertOne({name: 'foo'});
    t.ok(await collection.drop(), 'collection.drop() should drop an existent collection');
    await t.catch(collection.drop(), 'collection.drop() should throw an error so as collection is not existent');

    return (await collection.connection).disconnect();
});

test('Collection.updateOne()', async t => {
    const collection = repo().get(TestCollection);
    const {ref} = await collection.insertOne({name: 'foo'});

    ref.number = 98;
    const res1 = await collection.updateOne(ref._id, ref);
    const res11 = await collection.findOne(ref._id);
    t.ok(res1.modified === 1, 'collection.updateOne(ref, ref) should be ok');
    t.same(ref.toObject(), res11.toObject(), 'collection.findOne(ref._id) should get a valid updated document');

    ref.number = 99;
    const res2 = await collection.updateOne(ref._id, ref);
    t.ok(res2.modified === 1, 'collection.updateOne(ref._id, ref) should be ok');

    ref.number = 100;
    const res3 = await collection.updateOne({_id: ref._id.toString()}, ref);
    t.ok(res3.modified === 1, 'collection.updateOne(ref._id.toString(), ref) should be ok');

    await collection.drop();
    return (await collection.connection).disconnect();
});

test('Collection.save()', async t => {
    const collection = repo().get(TestCollection);
    const {ref} = await collection.insertOne({name: 'foo', number: 1});

    ref.number = 2;
    const res1 = await collection.save(ref);
    t.ok(res1 instanceof UpdateResult && res1.modified === 1, 'collection.save(ref) should be ok');

    const res2 = await collection.save({name: 'bar', number: 3});
    t.ok(res2 instanceof InsertResult && res2.insertedId, 'collection.save({name: bar}) should be ok');

    const res3 = await collection.save(collection.factory({name: 'bar', number: 4}));
    t.ok(res3 instanceof InsertResult && res3.insertedId, 'collection.save(collection.factory({name: bar})) should be ok');

    await collection.drop();
    return (await collection.connection).disconnect();
});
