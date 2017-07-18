"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const document_1 = require("./document");
const cursor_1 = require("./cursor");
const store_1 = require("./metadata/store");
const helpers_1 = require("./collection/helpers");
const query_1 = require("./query");
const schema_1 = require("./schema");
var Events;
(function (Events) {
    Events.beforeInsert = 'beforeInsert';
    Events.beforeUpdate = 'beforeUpdate';
    Events.beforeDelete = 'beforeDelete';
    Events.afterInsert = 'afterInsert';
    Events.afterUpdate = 'afterUpdate';
    Events.afterDelete = 'afterDelete';
})(Events = exports.Events || (exports.Events = {}));
class Collection {
    constructor(connection, name, options, construct) {
        const metadata = store_1.MetadataStore.getCollectionMetadata(this.constructor) || {};
        const indexes = store_1.MetadataStore.getCollectionIndexMetadata(this.constructor) || [];
        this.name = name || metadata.name;
        this.construct = construct || metadata.construct;
        // this.state provide a collection instance from a lazy connection
        this.state = connection.then((connection) => connection.get(this.name, options || metadata.options));
        this.connection = connection;
        this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            const existing = yield collection.indexes();
            indexes.forEach(index => {
                let indexName;
                if (typeof index.indexOrSpec === 'string') {
                    indexName = `${index.indexOrSpec}_1`;
                }
                else {
                    indexName = Object.keys(index.indexOrSpec)
                        .map(key => `${key}_${index.indexOrSpec[key]}`)
                        .join('_');
                }
                if (existing.filter(x => x.name == indexName).length === 0) {
                    this.createIndex(index.indexOrSpec, Object.assign({ background: true }, index.options))
                        .catch(error => {
                        console.log(index, error.stack);
                    });
                }
            });
        }));
    }
    get collection() {
        return this.state;
    }
    /**
     * @param fn
     * @returns {any}
     */
    queue(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collection = yield this.state;
                return fn(collection);
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    filter(filter) {
        if (filter instanceof document_1.SchemaDocument) {
            return { _id: filter._id };
        }
        return this.normalizeQuery(filter);
    }
    normalizeQuery(query) {
        if (query instanceof schema_1.ObjectID) {
            return { _id: query };
        }
        else if (typeof query === 'string') {
            return { _id: schema_1.ObjectID.createFromHexString(query) };
        }
        return new query_1.Query(this.construct, query).format();
    }
    /**
     * @param document
     * @returns {TDocument}
     */
    factory(document) {
        return this.construct.factory(document);
    }
    /**
     * @param document
     * @returns {Promise<UpdateResult | InsertResult>}
     */
    save(document) {
        assert_1.ok(document && typeof document === 'object', 'Collection.save(document) require an object or an instance of SchemaDocument.');
        let prepared = document;
        if (false === document instanceof document_1.SchemaDocument) {
            prepared = this.factory(document);
        }
        if (prepared._id) {
            return this.updateOne(this.filter(prepared), prepared);
        }
        return this.insertOne(prepared);
    }
    /**
     * @param pipeline
     * @param options
     * @returns {any}
     */
    aggregate(pipeline, options) {
        return this.queue(collection => collection.aggregate(this.normalizeQuery(pipeline), options));
    }
    /**
     * @param operations
     * @param options
     * @returns {any}
     */
    bulkWrite(operations, options) {
        return this.queue(collection => collection.bulkWrite(operations, options));
    }
    /**
     * @param query
     * @param options
     * @returns {Promise<number>}
     */
    count(query, options) {
        return this.queue(collection => collection.count(this.normalizeQuery(query), options));
    }
    /**
     * @param fieldOrSpec
     * @param options
     * @returns void
     */
    createIndex(fieldOrSpec, options) {
        return this.queue(collection => collection.createIndex(fieldOrSpec, options));
    }
    /**
     * @param indexSpecs
     * @returns void
     */
    createIndexes(indexSpecs) {
        return this.queue(collection => collection.createIndexes(indexSpecs));
    }
    /**
     * @param filter
     * @param options
     */
    deleteMany(filter, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () { return new helpers_1.DeleteResult(yield collection.deleteMany(this.normalizeQuery(filter), options)); }));
    }
    /**
     * @param filter
     * @param options
     */
    deleteOne(filter, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            if (filter instanceof document_1.SchemaDocument) {
                yield filter.call(Events.beforeDelete, this);
                const deleteResult = new helpers_1.DeleteResult(yield collection.deleteOne(this.filter(filter), options));
                yield filter.call(Events.afterDelete, this);
                return deleteResult;
            }
            return new helpers_1.DeleteResult(yield collection.deleteOne(filter, options));
        }));
    }
    /**
     * @param key
     * @param query
     * @param options
     */
    distinct(key, query, options) {
        return this.queue(collection => collection.distinct(key, this.normalizeQuery(query), options));
    }
    /**
     * @TODO
     */
    drop() {
        return this.queue(collection => collection.drop());
    }
    /**
     * @TODO
     */
    dropIndex(indexName, options) {
        return this.queue(collection => collection.dropIndex(indexName, options));
    }
    /**
     * @TODO
     */
    dropIndexes() {
        return this.queue(collection => collection.dropIndexes());
    }
    /**
     * @param query
     * @returns {Cursor<TDocument>}
     */
    find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queue((collection) => new cursor_1.Cursor(collection.find(this.normalizeQuery(query)), (document) => this.factory(document)));
        });
    }
    /**
     * @param query
     * @param options
     * @returns {Promise<TDocument>}
     */
    findOne(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = yield this.find(query);
            cursor.limit(1);
            if (options && options.sort) {
                cursor.sort(options.sort);
            }
            return cursor.fetch();
        });
    }
    /**
     * @param filter
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndDelete(filter, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            const result = yield collection.findOneAndDelete(this.filter(filter), options);
            return new helpers_1.FindAndModifyResult({ lastErrorObject: result.lastErrorObject, value: result.value, factory: (d) => this.factory(d) });
        }));
    }
    /**
     * @param filter
     * @param replacement
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndReplace(filter, replacement, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            const result = yield collection.findOneAndReplace(this.filter(filter), replacement, options);
            return new helpers_1.FindAndModifyResult({ lastErrorObject: result.lastErrorObject, value: result.value, factory: (d) => this.factory(d) });
        }));
    }
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndUpdate(filter, update, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            const result = yield collection.findOneAndUpdate(this.filter(filter), update, options);
            return new helpers_1.FindAndModifyResult({ lastErrorObject: result.lastErrorObject, value: result.value, factory: (d) => this.factory(d) });
        }));
    }
    /**
     * @TODO Update returns definitions.
     *
     * @param x
     * @param y
     * @param options
     * @returns {Promise<{results: any[]}>}
     */
    geoHaystackSearch(x, y, options) {
        return this.queue(collection => collection.geoHaystackSearch(x, y, options));
    }
    /**
     * @TODO Update returns definitions.
     *
     * @param x
     * @param y
     * @param options
     * @returns {Promise<{results: any[]}>}
     */
    geoNear(x, y, options) {
        return this.queue(collection => collection.geoNear(x, y, options));
    }
    /**
     * @TODO
     */
    indexes() {
        return this.queue(collection => collection.indexes());
    }
    /**
     * @TODO
     */
    indexExists(indexes) {
        return this.queue(collection => collection.indexExists(indexes));
    }
    /**
     * @TODO
     */
    indexInformation(options) {
        return this.queue(collection => collection.indexInformation(options));
    }
    /**
     * @TODO
     */
    initializeOrderedBulkOp(options) {
        return this.queue(collection => collection.initializeOrderedBulkOp(options));
    }
    /**
     * @TODO
     */
    initializeUnorderedBulkOp(options) {
        return this.queue(collection => collection.initializeUnorderedBulkOp(options));
    }
    createObjectReference(doc) {
        const reference = {
            [Symbol.for('ref')]: [doc],
            unref() {
                return this[Symbol.for('ref')].pop(); // delete reference for original document
            }
        };
        return Object.assign(reference, doc.extract());
    }
    /**
     * @TODO Mutate result
     *
     * @param docs
     * @param options
     * @returns {Promise<InsertWriteOpResult>}
     */
    insertMany(docs, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            const documents = docs.map(doc => doc instanceof document_1.SchemaDocument ? doc : this.factory(doc));
            yield Promise.all(documents.map(document => document.call(Events.beforeInsert, this)));
            const result = yield collection.insertMany(documents.map(doc => this.createObjectReference(doc)), options);
            const insertResultList = result.ops.map(res => {
                return new helpers_1.InsertResult({ insertedId: res._id }, res.unref());
            });
            yield Promise.all(insertResultList.map(({ ref }) => ref.call(Events.afterInsert, this)));
            return insertResultList;
        }));
    }
    /**
     * @param document
     * @param options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    insertOne(document, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            let formalized;
            if (document instanceof document_1.SchemaDocument) {
                formalized = document;
            }
            else {
                formalized = this.factory(document);
            }
            yield formalized.call(Events.beforeInsert, this);
            const insertResult = new helpers_1.InsertResult(yield collection.insertOne(formalized.extract(), options), formalized);
            yield formalized.call(Events.afterInsert, this);
            return insertResult;
        }));
    }
    /**
     * @TODO
     */
    isCapped() {
        return this.queue(collection => collection.isCapped());
    }
    /**
     * @TODO
     */
    listIndexes(options) {
        return this.queue(collection => collection.listIndexes(options));
    }
    /**
     * @TODO
     */
    mapReduce(map, reduce, options) {
        return this.queue(collection => collection.mapReduce(map, reduce, options));
    }
    /**
     * @TODO
     */
    options() {
        return this.queue(collection => collection.options());
    }
    /**
     * @TODO
     */
    parallelCollectionScan(options) {
        return this.queue(collection => collection.parallelCollectionScan(options));
    }
    /**
     * @TODO
     */
    reIndex() {
        return this.queue(collection => collection.reIndex());
    }
    /**
     * @TODO
     */
    rename(newName, options) {
        return this.queue(collection => collection.rename(newName, options));
    }
    /**
     * @TODO Update returns definitions.
     *
     * @param filter
     * @param doc
     * @param options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    replaceOne(filter, doc, options) {
        return this.queue(collection => collection.replaceOne(filter, doc, options));
    }
    /**
     * @TODO
     */
    stats(options) {
        return this.queue(collection => collection.stats(options));
    }
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateMany(filter, update, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            return new helpers_1.UpdateResult(yield collection.updateMany(this.normalizeQuery(filter), update, options));
        }));
    }
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateOne(filter, update, options) {
        return this.queue((collection) => __awaiter(this, void 0, void 0, function* () {
            let updateSchema = update;
            if (update instanceof document_1.SchemaDocument) {
                yield update.call(Events.beforeUpdate, this);
                const _a = update.extract(), { _id } = _a, document = __rest(_a, ["_id"]);
                updateSchema = { $set: document };
            }
            const updateResult = new helpers_1.UpdateResult(yield collection.updateOne(this.filter(filter), updateSchema, options));
            if (update instanceof document_1.SchemaDocument) {
                yield update.call(Events.afterUpdate, this);
            }
            return updateResult;
        }));
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map