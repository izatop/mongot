import * as MongoDb from 'mongodb';
import {SchemaDocument} from "./document";
import {Cursor} from "./cursor";
import {Connection} from "./connection";
import {MetadataStore} from "./metadata/store";

const states = new WeakSet<SchemaDocument>();

function mutateModifyPromise<T>(result: Promise<{value: Object, lastErrorObject: Object, ok: number}>): Promise<T> {
    return result.then(result => result.value) as Promise<T>;
}

class Collection<TDocument extends SchemaDocument> {
    private readonly construct: typeof SchemaDocument;
    private readonly state: PromiseLike<MongoDb.Collection>;
    private readonly name: string;
    
    constructor(
        connection: Promise<Connection>,
        name?: string,
        options?: MongoDb.CollectionOptions | MongoDb.CollectionCreateOptions,
        construct?: typeof SchemaDocument
    ) {
        const metadata = MetadataStore.getCollectionMetadata(<typeof Collection> this.constructor) || <any> {};
        
        this.name = name || metadata.name;
        this.construct = construct || metadata.construct;
        this.state = connection.then(connection => connection.get(name, options || metadata.options));
    }
    
    get collection(): PromiseLike<MongoDb.Collection> {
        return this.state;
    }
    
    /**
     * @param document
     * @returns {TDocument}
     */
    factory(document?: Object): TDocument {
        return this.construct.factory<TDocument>(document) as TDocument;
    }
    
    /**
     * @param instance
     * @returns {any}
     */
    save(instance: TDocument): Promise<any> {
        if (states.has(instance)) {
            return this.updateOne({_id: instance._id}, {$set: Object.assign({}, instance)});
        } else {
            return this.insertOne(Object.assign({}, instance)).then(result => {
                states.add(instance);
                return result;
            });
        }
    }
    
    /**
     * @param fn
     * @returns {any}
     */
    private async queue<T>(fn: (collection: MongoDb.Collection) => T): Promise<T> {
        try {
            const collection = await this.state;
            return fn(collection);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    
    /**
     * @param pipeline
     * @param options
     * @returns {undefined}
     */
    aggregate<TResult extends Object>(pipeline: Object[], options: MongoDb.CollectionAggregationOptions): Promise<TResult> {
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
        return this.queue(collection => collection.deleteMany(filter, options));
    }
    
    /**
     * @param filter
     * @param options
     */
    deleteOne(filter: Object, options?: { w?: number | string, wtimmeout?: number, j?: boolean, bypassDocumentValidation?: boolean }) {
        return this.queue(collection => collection.deleteOne(filter, options));
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
    async find(query: Object): Promise<Cursor<TDocument>> {
        return this.queue(collection => new Cursor<TDocument>(collection.find(query)));
    }
    
    /**
     * @param query
     * @param options
     * @returns {Promise<TDocument>}
     */
    async findOne(query?: Object, options?: MongoDb.FindOneOptions): Promise<TDocument> {
        const cursor = await this.find(query);
        
        cursor.limit(1);
        if (options.sort) {
            cursor.sort(<any> options.sort);
        }
        
        return cursor.fetch();
    }
    
    /**
     * @param filter
     * @param options
     * @returns {Promise<TDocument>}
     */
    findOneAndDelete(filter: Object, options?: { projection?: Object, sort?: Object, maxTimeMS?: number }): Promise<TDocument> {
        return mutateModifyPromise<TDocument>(this.queue(collection => collection.findOneAndDelete(filter, options)));
    }
    
    /**
     * @param filter
     * @param replacement
     * @param options
     * @returns {Promise<TDocument>}
     */
    findOneAndReplace(filter: Object, replacement: Object, options?: MongoDb.FindOneAndReplaceOption):Promise<TDocument> {
        return mutateModifyPromise<TDocument>(this.queue(collection => collection.findOneAndReplace(filter, replacement, options)));
    }
    
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<TDocument>}
     */
    findOneAndUpdate(filter: Object, update: Object, options?: MongoDb.FindOneAndReplaceOption):Promise<TDocument> {
        return mutateModifyPromise<TDocument>(this.queue(collection => collection.findOneAndUpdate(filter, update, options)));
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
    
    /**
     * @TODO Mutate result
     *
     * @param docs
     * @param options
     * @returns {Promise<InsertWriteOpResult>}
     */
    insertMany(docs: TDocument[], options?: MongoDb.CollectionInsertManyOptions) {
        return this.queue(collection => collection.insertMany(docs, options));
    }
    
    /**
     * @TODO Mutate result
     *
     * @param doc
     * @param options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    insertOne(doc: TDocument, options?: MongoDb.CollectionInsertOneOptions) {
        return this.queue(collection => collection.insertOne(doc, options));
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
        return this.queue(collection => collection.updateOne(filter, update, options));
    }
}

export {Collection};
