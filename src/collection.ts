import * as MongoDb from 'mongodb';
import {SchemaDocument} from "./document";
import {Cursor} from "./cursor";
import {Connection} from "./connection";
import {MetadataStore} from "./metadata/store";
import {InsertResult, DeleteResult, UpdateResult, FindAndModifyResult} from "./collection/helpers";

class Collection<TDocument extends SchemaDocument> {
    private readonly construct: typeof SchemaDocument;
    private readonly state: PromiseLike<MongoDb.Collection>;
    private readonly name: string;
    public readonly connection: Promise<Connection>;
    
    constructor(
        connection: Promise<Connection>,
        name?: string,
        options?: MongoDb.CollectionOptions | MongoDb.CollectionCreateOptions,
        construct?: typeof SchemaDocument
    ) {
        const metadata = MetadataStore.getCollectionMetadata(<typeof Collection> this.constructor) || <any> {};
        
        this.name = name || metadata.name;
        this.construct = construct || metadata.construct;
        this.state = connection.then(connection => connection.get(this.name, options || metadata.options));
        this.connection = connection;
    }
    
    get collection(): PromiseLike<MongoDb.Collection> {
        return this.state;
    }

    /**
     * @param fn
     * @returns {any}
     */
    private async queue<T>(fn: (collection: MongoDb.Collection) => T | PromiseLike<T>): Promise<T> {
        try {
            const collection = await this.state;
            return fn(collection);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    
    private filter(filter: Object | TDocument): Object {
        if (filter instanceof SchemaDocument) {
            return {_id: filter._id};
        }
        
        return filter;
    }
    
    /**
     * @param document
     * @returns {TDocument}
     */
    factory(document?: Object): TDocument {
        return this.construct.factory<TDocument>(document) as TDocument;
    }
    
    /**
     * @param document
     * @returns {Promise<UpdateResult | InsertResult>}
     */
    save(document: TDocument): Promise<UpdateResult<TDocument> | InsertResult<TDocument>> {
        if (document._id) {
            return this.updateOne({_id: document._id}, {$set: document.toObject()});
        } else {
            return this.insertOne(document);
        }
    }
    
    /**
     * @param pipeline
     * @param options
     * @returns {undefined}
     */
    aggregate<TResult extends Object>(pipeline: Object[], options?: MongoDb.CollectionAggregationOptions): Promise<TResult> {
        return this.queue(collection => collection.aggregate(pipeline, options));
    }
    
    /**
     * @param operations
     * @param options
     * @returns {undefined}
     */
    bulkWrite<TResult extends MongoDb.BulkWriteResult>(operations: Object[], options: MongoDb.CollectionBluckWriteOptions): Promise<TResult> {
        return this.queue(collection => collection.bulkWrite(operations, options));
    }
    
    /**
     * @param query
     * @param options
     * @returns {undefined}
     */
    count(query: Object, options: MongoDb.MongoCountPreferences): Promise<number> {
        return this.queue(collection => collection.count(query, options));
    }
    
    /**
     * @param fieldOrSpec
     * @param options
     * @returns void
     */
    createIndex(fieldOrSpec: string|any, options: MongoDb.IndexOptions) {
        return this.queue(collection => collection.createIndex(fieldOrSpec, options));
    }
    
    /**
     * @param indexSpecs
     * @returns void
     */
    createIndexes(indexSpecs: Object[]) {
        return this.queue(collection => collection.createIndexes(indexSpecs));
    }
    
    /**
     * @param filter
     * @param options
     */
    deleteMany(filter: Object, options?: MongoDb.CollectionOptions) {
        return this.queue(async (collection): Promise<DeleteResult> => new DeleteResult(await collection.deleteMany(filter, options)));
    }
    
    /**
     * @param filter
     * @param options
     */
    deleteOne(filter: Object, options?: { w?: number | string, wtimmeout?: number, j?: boolean, bypassDocumentValidation?: boolean }) {
        return this.queue(async (collection): Promise<DeleteResult> => new DeleteResult(await collection.deleteOne(filter, options)));
    }
    
    /**
     * @param key
     * @param query
     * @param options
     */
    distinct(key: string, query: Object, options?: { readPreference?: MongoDb.ReadPreference | string }) {
        return this.queue(collection => collection.distinct(key, options));
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
    dropIndex(indexName: string, options?: MongoDb.CollectionOptions) {
        return this.queue(collection => collection.dropIndex(indexName, options))
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
    async find(query?: Object): Promise<Cursor<TDocument>> {
        return this.queue((collection): Cursor<TDocument> => new Cursor<TDocument>(collection.find(query), (document) => this.factory(document)));
    }
    
    /**
     * @param query
     * @param options
     * @returns {Promise<TDocument>}
     */
    async findOne(query?: Object, options?: {sort: Object}): Promise<TDocument> {
        const cursor = await this.find(query);

        cursor.limit(1);
        if (options && options.sort) {
            cursor.sort(<any> options.sort);
        }
        
        return cursor.fetch();
    }
    
    /**
     * @param filter
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndDelete(filter: Object, options?: { projection?: Object, sort?: Object, maxTimeMS?: number }): Promise<FindAndModifyResult<TDocument>> {
        return this.queue(async (collection): Promise<FindAndModifyResult<TDocument>> => {
            const result = await collection.findOneAndDelete(this.filter(filter), options);
            return new FindAndModifyResult({lastErrorObject: result.lastErrorObject, value: result.value, factory: (d) => this.factory(d)});
        });
    }
    
    /**
     * @param filter
     * @param replacement
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndReplace(filter: Object, replacement: Object, options?: MongoDb.FindOneAndReplaceOption): Promise<FindAndModifyResult<TDocument>> {
        return this.queue(async (collection): Promise<FindAndModifyResult<TDocument>> => {
            const result = await collection.findOneAndReplace(this.filter(filter), replacement, options);
            return new FindAndModifyResult({lastErrorObject: result.lastErrorObject, value: result.value, factory: (d) => this.factory(d)});
        });
    }
    
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndUpdate(filter: Object, update: Object, options?: MongoDb.FindOneAndReplaceOption): Promise<FindAndModifyResult<TDocument>> {
        return this.queue(async (collection): Promise<FindAndModifyResult<TDocument>> => {
            const result = await collection.findOneAndUpdate(this.filter(filter), update, options);
            return new FindAndModifyResult({lastErrorObject: result.lastErrorObject, value: result.value, factory: (d) => this.factory(d)});
        });
    }
    
    /**
     * @TODO Update returns definitions.
     *
     * @param x
     * @param y
     * @param options
     * @returns {Promise<{results: any[]}>}
     */
    geoHaystackSearch(x: number, y: number, options?: MongoDb.GeoHaystackSearchOptions): Promise<{results: any[]}> {
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
    geoNear(x: number, y: number, options?: MongoDb.GeoNearOptions): Promise<{results: any[]}> {
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
    indexExists(indexes: string | string[]) {
        return this.queue(collection => collection.indexExists(indexes));
    }
    
    /**
     * @TODO
     */
    indexInformation(options?: { full: boolean }) {
        return this.queue(collection => collection.indexInformation(options));
    }
    
    /**
     * @TODO
     */
    initializeOrderedBulkOp(options?: MongoDb.CollectionOptions) {
        return this.queue(collection => collection.initializeOrderedBulkOp(options));
    }
    
    /**
     * @TODO
     */
    initializeUnorderedBulkOp(options?: MongoDb.CollectionOptions) {
        return this.queue(collection => collection.initializeUnorderedBulkOp(options));
    }
    
    private createObjectReference(doc: TDocument) {
        const reference = {
            [Symbol.for('ref')]: [doc],
            unref() {
                return this[Symbol.for('ref')].pop(); // delete reference for original document
            }
        };
        
        return Object.assign(reference, doc.toObject());
    }
    
    /**
     * @TODO Mutate result
     *
     * @param docs
     * @param options
     * @returns {Promise<InsertWriteOpResult>}
     */
    insertMany(docs: TDocument[], options?: MongoDb.CollectionInsertManyOptions) {
        return this.queue(async (collection): Promise<Array<InsertResult<TDocument>>> => {
            const result = await collection.insertMany(docs.map(doc => this.createObjectReference(doc)), options);
            return result.ops.map(res => {
                return new InsertResult({insertedId: res._id}, res.unref());
            })
        });
    }
    
    /**
     * @param doc
     * @param options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    insertOne(doc: TDocument, options?: MongoDb.CollectionInsertOneOptions) {
        return this.queue(async (collection): Promise<InsertResult<TDocument>> => {
            return new InsertResult(await collection.insertOne(doc.toObject(), options), doc);
        });
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
    listIndexes(options?: { batchSize?: number, readPreference?: MongoDb.ReadPreference | string }) {
        return this.queue(collection => collection.listIndexes(options));
    }
    
    /**
     * @TODO
     */
    mapReduce<TResult>(map: Function | string, reduce: Function | string, options?: MongoDb.MapReduceOptions):Promise<TResult> {
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
    parallelCollectionScan(options?: MongoDb.ParallelCollectionScanOptions) {
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
    rename(newName: string, options?: { dropTarget?: boolean }) {
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
    replaceOne(filter: Object, doc: Object, options?: MongoDb.ReplaceOneOptions) {
        return this.queue(collection => collection.replaceOne(filter, doc, options));
    }
    
    /**
     * @TODO
     */
    stats(options?: { scale: number }) {
        return this.queue(collection => collection.stats(options));
    }
    
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateMany(filter: Object, update: Object, options?: Object) {
        return this.queue(collection => collection.updateMany(filter, update, options));
    }
    
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateOne(filter: Object, update: Object, options?: Object) {
        return this.queue(async (collection): Promise<UpdateResult<TDocument>> => new UpdateResult(await collection.updateOne(filter, update, options)));
    }
}

export {Collection};
