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
const cursor_1 = require("./cursor");
const TestCollection_1 = require("./spec/TestCollection");
const helpers_1 = require("./collection/helpers");
const document_1 = require("./document");
const schema_1 = require("./schema");
function setupMany(collection, documents, raw) {
    const data = raw || ['foo', 'bar', 'baz'].map(name => ({ name }));
    data.map(x => collection.factory(x))
        .forEach(x => documents.push(x));
    return collection.insertMany(documents);
}
wrap_1.default('Collection.find()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const result = yield collection.find({});
    t.ok(result instanceof cursor_1.Cursor, 'TestCollection.find({}) should return Promise<Cursor>');
    t.ok(result.cursor, 'A result should have an original cursor');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.find().fetchAll()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const foos = [];
    for (let i = 0; i < 100; i++) {
        foos.push({ name: "foo" + i.toString() });
    }
    yield setupMany(collection, documents, foos);
    const cursor = yield collection.find({});
    const result = yield cursor.fetchAll();
    t.equal(result.length, 100, 'result.fetchAll() should return 100 documents');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.findOne(query)', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const foos = [];
    for (let i = 0; i < 10; i++) {
        foos.push({ name: "foo" + i.toString() });
    }
    yield setupMany(collection, documents, foos);
    const index = Math.round(Math.random() * documents.length - 1);
    const query = { _id: documents[index]._id.toHexString() };
    const queryMulti = { _id: { $in: documents.map(x => x._id.toHexString()) } };
    const doc = yield collection.findOne(query);
    const docs = yield collection.find(queryMulti);
    t.same(doc._id, documents[index]._id, 'collection.findOne(query) should return valid document');
    t.same((yield docs.fetchAll()).length, documents.length, 'collection.find(query) should return valid count of documents');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.find().fetch()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const foos = [];
    try {
        for (let i = 0; i < 100; i++) {
            foos.push({ name: "foo" + i.toString() });
        }
        yield setupMany(collection, documents, foos);
        const cursor = yield collection.find({});
        let counter = 0, result;
        do {
            result = yield cursor.fetch();
            if (result) {
                counter++;
            }
        } while (result);
        t.equal(counter, 100, 'result.fetch() should read 100 records');
    }
    catch (error) {
        t.fail(error);
    }
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.find().project()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const number = Math.random();
    yield setupMany(collection, documents, [{ name: 'foo', number, version: 1 }]);
    const result = yield (yield collection.find({})).project({ name: 1, number: 1 }).fetch();
    t.ok(result instanceof document_1.PartialDocumentFragment, 'TestCollection.find({}).project().fetch() should return PartialDocumentFragment instead TestDocument');
    t.same(result.toObject(), { name: 'foo', number, _id: result._id.toString() }, 'PartialDocumentFragment should have custom fields');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.insertOne()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const document = collection.factory({ any: { any: false }, name: 'One', someId: "555330303030303331323132" });
    const result = yield collection.insertOne(document);
    const inserted = yield collection.findOne(result.insertedId);
    t.ok(result.ref._id === document._id, 'collection.insertOne() should affect on a document');
    t.ok(result instanceof helpers_1.InsertResult, 'collection.insertOne() should return InsertResult');
    t.ok(result.insertedId instanceof schema_1.ObjectID, 'result.insertedId should be ObjectID');
    t.ok(document.someId instanceof schema_1.ObjectID, 'TestDocument.someId should be ObjectID');
    t.ok(typeof document.autoIncrement === 'number', 'TestDocument.autoIncrement should be set');
    t.equals(document._id, result.insertedId, 'TestDocument should have insertedId');
    t.equals(document, result.ref, 'result.ref should be TestDocument');
    t.equals(document.version, 1, 'TestDocument.beforeInsert should be fired');
    t.same(document.toObject(), inserted.toObject(), 'TestDocument should be inserted correctly');
    t.ok(document.long instanceof schema_1.Long, 'TestDocument.long should be Long');
    t.equal(document.toObject().long, document.long.toJSON(), 'TestDocument.toObject().long should correct');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.insertMany()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const result = yield setupMany(collection, documents);
    t.ok(result.filter(x => x instanceof helpers_1.InsertResult).length === documents.length, 'collection.insertMany() should return InsertResult[]');
    result.forEach(res => {
        t.ok(documents.filter(x => x === res.ref).length === 1, `InsertResult.ref should match original ${res.ref.name}`);
    });
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.deleteMany()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const result = yield setupMany(collection, documents);
    t.equals(result.length, documents.length, 'documents should be inserted');
    const deleteResult = yield collection.deleteMany({ _id: { $in: documents.map(x => x._id) } });
    t.ok(deleteResult instanceof helpers_1.DeleteResult, 'deleteResult should be DeleteResult');
    t.equals(deleteResult.count, documents.length, 'deleteResult.count should be equals of documents count');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.deleteOne()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    const result = yield setupMany(collection, documents);
    t.equals(result.length, documents.length, 'documents should be inserted');
    const deleteResult = yield collection.deleteOne({ _id: { $in: documents.map(x => x._id) } });
    t.ok(deleteResult instanceof helpers_1.DeleteResult, 'deleteResult should be DeleteResult');
    t.equals(deleteResult.count, 1, 'deleteResult.count should be 1');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.findOneAndUpdate/Replace/Delete()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    yield setupMany(collection, documents);
    const findOneAndUpdateUndefinedResult = yield collection.findOneAndUpdate({ undefinedKey: 'unknown' }, { $set: { name: 'foo2' } });
    const findOneAndUpdateResult = yield collection.findOneAndUpdate(documents[0], { $set: { name: 'foo2' } });
    const findOneAndReplaceResult = yield collection.findOneAndReplace(documents[1], Object.assign({}, documents[1], { name: 'bar1' }), { returnOriginal: false });
    const findOneAndDeleteResult = yield collection.findOneAndDelete(documents[2]);
    t.equal(findOneAndUpdateUndefinedResult.has(), false, 'findOneAndUpdateUndefinedResult.has() should return false');
    t.equal(findOneAndUpdateUndefinedResult.get(), null, 'findOneAndUpdateUndefinedResult.get() should return null');
    t.equal(findOneAndUpdateResult.has(), true, 'findOneAndUpdateResult.has() should return true');
    t.same(findOneAndUpdateResult.get().name, 'foo', 'findOneAndUpdateResult should contain an original document');
    t.equal(findOneAndReplaceResult.has(), true, 'findOneAndReplaceResult.has() should return true');
    t.same(findOneAndReplaceResult.get().name, 'bar1', 'findOneAndReplaceResult should contain a replaced document');
    t.same(findOneAndDeleteResult.get().toObject()._id, documents[2].toObject()._id, 'findOneAndDeleteResult should contain a deleted document');
    const long = schema_1.Long.fromNumber(Math.random() * 100000000);
    const res = yield collection.findOneAndUpdate({ long }, { name: 'clean', long }, { upsert: true, returnOriginal: false });
    t.ok(res.has(), 'FindAndModifyResult should has a document');
    t.ok(res.get(), 'FindAndModifyResult should get a document');
    t.ok(res.get()._id, 'FindAndModifyResult should get _id');
    t.ok(res.get().long instanceof schema_1.Long, 'A document.long should be Long BSON type');
    t.ok(yield collection.findOne(res.get()._id), 'A document should exist');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.find()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    yield setupMany(collection, documents);
    const all = yield collection.find({ _id: { $in: documents.map(x => x._id) } });
    t.ok(all instanceof cursor_1.Cursor, 'collection.find() should return Cursor');
    t.same((yield all.fetchAll()).map(x => x.toObject()), documents.map(x => x.toObject()));
    t.equals(yield all.rewind().count(), documents.length);
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.findOne()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const documents = [];
    yield setupMany(collection, documents);
    const document = yield collection.findOne(documents[1]._id);
    t.same(document.toObject(), documents[1].toObject(), 'collection.findOne() should return valid document');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.drop()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    yield collection.connection;
    yield collection.insertOne({ name: 'foo' });
    t.ok(yield collection.drop(), 'collection.drop() should drop an existent collection');
    yield t.catch(collection.drop(), 'collection.drop() should throw an error so as collection is not existent');
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.updateOne()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const { ref } = yield collection.insertOne({ name: 'foo' });
    ref.number = 98;
    const res1 = yield collection.updateOne(ref._id, ref);
    const res11 = yield collection.findOne(ref._id);
    t.ok(res1.modified === 1, 'collection.updateOne(ref, ref) should be ok');
    t.same(ref.toObject(), res11.toObject(), 'collection.findOne(ref._id) should get a valid updated document');
    ref.number = 99;
    const res2 = yield collection.updateOne(ref._id, ref);
    t.ok(res2.modified === 1, 'collection.updateOne(ref._id, ref) should be ok');
    ref.number = 100;
    const res3 = yield collection.updateOne({ _id: ref._id.toString() }, ref);
    t.ok(res3.modified === 1, 'collection.updateOne(ref._id.toString(), ref) should be ok');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
wrap_1.default('Collection.save()', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default().get(TestCollection_1.TestCollection);
    const { ref } = yield collection.insertOne({ name: 'foo', number: 1 });
    ref.number = 2;
    const res1 = yield collection.save(ref);
    t.ok(res1 instanceof helpers_1.UpdateResult && res1.modified === 1, 'collection.save(ref) should be ok');
    const res2 = yield collection.save({ name: 'bar', number: 3 });
    t.ok(res2 instanceof helpers_1.InsertResult && res2.insertedId, 'collection.save({name: bar}) should be ok');
    const res3 = yield collection.save(collection.factory({ name: 'bar', number: 4 }));
    t.ok(res3 instanceof helpers_1.InsertResult && res3.insertedId, 'collection.save(collection.factory({name: bar})) should be ok');
    t.equal(ref.version, 2, 'An in-Memory document version should be valid');
    t.equal((yield collection.findOne(ref._id)).version, 2, 'A saved document version should be valid');
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
//# sourceMappingURL=collection.spec.js.map