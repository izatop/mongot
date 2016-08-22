import test from './spec/wrap';
import repo from './spec/connect';
import {Cursor} from "./cursor";
import {Collection} from './collection';
import {TestCollection} from "./spec/TestCollection";
import {InsertResult, DeleteResult} from "./collection/helpers";
import {ObjectID} from "mongodb";
import {TestDocument} from "./spec/TestDocument";

function setupMany(collection: TestCollection, documents: Array<TestDocument>) {
    const data = ['foo', 'bar', 'baz'];
    data.map(name => collection.factory({name})).forEach(x => documents.push(x));
    return collection.insertMany(documents);
}

test('Collection.find()', async (t) => {
    const collection = repo().get(TestCollection);
    const result = await collection.find({});
    
    t.ok(result instanceof Cursor, 'TestCollection.find({}) should return Promise<Cursor>');
    t.ok(result.cursor, 'A result should have an original cursor');

    return (await collection.connection).disconnect();
});

test('Collection.insertOne()', async (t) => {
    const collection = repo().get(TestCollection);
    const document = collection.factory();
    document.any = {any: false};
    document.name = 'One';
    
    const result = await collection.insertOne(document);
    t.ok(result instanceof InsertResult, 'collection.insertOne() should return InsertResult');
    t.ok(result.insertedId instanceof ObjectID, 'result.insertedId should be ObjectID');
    t.equals(document._id, result.insertedId, 'TestDocument should have insertedId');
    t.equals(document, result.ref, 'result.ref should be TestDocument');
    
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
    
    return (await collection.connection).disconnect();
});

test('Collection.deleteMany()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    await setupMany(collection, documents);
    const result = await setupMany(collection, documents);
    
    t.equals(result.length, documents.length, 'documents should be inserted');
    
    const deleteResult = await collection.deleteMany({_id: {$in: documents.map(x => x._id)}});
    t.ok(deleteResult instanceof DeleteResult, 'deleteResult should be DeleteResult');
    t.equals(deleteResult.count, documents.length, 'deleteResult.count should be equals of documents count');
    
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
    
    return (await collection.connection).disconnect();
});

test('Collection.findOneAndUpdate/Replace/Delete()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    await setupMany(collection, documents);
    
    const findOneAndUpdateResult = await collection.findOneAndUpdate(documents[0], {$set: {name: 'foo2'}});
    const findOneAndReplaceResult = await collection.findOneAndReplace(documents[1], Object.assign({}, documents[1], {name: 'bar1'}), {returnOriginal: false});
    const findOneAndDeleteResult = await collection.findOneAndDelete(documents[2]);
    
    t.same(findOneAndUpdateResult.get().name, 'foo', 'findOneAndUpdateResult should contain an original document');
    t.same(findOneAndReplaceResult.get().name, 'bar1', 'findOneAndReplaceResult should contain a replaced document');
    t.same(findOneAndDeleteResult.get().toObject(), documents[2].toObject(), 'findOneAndDeleteResult should contain a deleted document');
    
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
    
    return (await collection.connection).disconnect();
});

test('Collection.findOne()', async (t) => {
    const collection = repo().get(TestCollection);
    const documents: Array<TestDocument> = [];
    await setupMany(collection, documents);
    
    const document = await collection.findOne(documents[1]._id);
    t.same(document.toObject(), documents[1].toObject());
    
    return (await collection.connection).disconnect();
});

test('Collection.drop()', async (t) => {
    const collection = repo().get(TestCollection);
    t.ok(await collection.drop(), 'collection.drop() should drop an existent collection');
    await t.catch(collection.drop(), 'collection.drop() should throw an error so as collection is not existent');
    
    return (await collection.connection).disconnect();
});

