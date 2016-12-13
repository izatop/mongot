import * as MongoDb from 'mongodb';
import {ok} from 'assert';
import {SchemaDocument} from "./document";
import {Cursor} from "./cursor";
import {Connection} from "./connection";
import {MetadataStore} from "./metadata/store";
import {InsertResult, DeleteResult, UpdateResult, FindAndModifyResult} from "./collection/helpers";
import {Query} from "./query";
import {ObjectID} from "mongodb";

namespace Events {
    export const beforeInsert = 'beforeInsert';
    export const beforeUpdate = 'beforeUpdate';
    export const beforeDelete = 'beforeDelete';
    
    export const afterInsert = 'afterInsert';
    export const afterUpdate = 'afterUpdate';
    export const afterDelete = 'afterDelete';
}

// Partial pattern doesn't work with deep interfaces and doesn't work correctly with getters.
//export type Partial<T> = Object & {[P in keyof T]?: T[P]};
export type Partial<T> = Object;

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
        const indexes = MetadataStore.getCollectionIndexMetadata(<typeof Collection> this.constructor) || [];
        
        this.name = name || metadata.name;
        this.construct = construct || metadata.construct;
        this.state = connection.then(connection => connection.get(this.name, options || metadata.options));
        this.connection = connection;
    
        this.queue(async collection => {
            const existing = await collection.indexes();
            indexes.forEach(index => {
                let indexName;
                if (typeof index.indexOrSpec === 'string') {
                    indexName = `${index.indexOrSpec}_1`;
                } else {
                    indexName = Object.keys(index.indexOrSpec)
                        .map(key => `${key}_${index.indexOrSpec[key]}`)
                        .join('_');
                }
            
                if (existing.filter(x => x.name == indexName).length === 0) {
                    this.createIndex(index.indexOrSpec, Object.assign({background: true}, index.options))
                        .catch(error => {
                            console.log(index, error.stack);
                        });
                }
            });
        });
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
    
    private filter(filter: Object | TDocument | string | ObjectID): Object {
        if (filter instanceof SchemaDocument) {
            return {_id: filter._id};
        }
        
        return this.normalizeQuery(filter);
    }
    
    private normalizeQuery(query: Object | ObjectID | string) {
        if (query instanceof ObjectID) {
            return {_id: query};
        } else if (typeof query === 'string') {
            return {_id: ObjectID.createFromHexString(query)};
        }
        
        return new Query(this.construct, query).format();
    }
    
    /**
     * @param document
     * @returns {TDocument}
     */
    factory(document?: Partial<TDocument>): TDocument {
        return this.construct.factory(document) as TDocument;
    }
    
    /**
     * @param document
     * @returns {Promise<UpdateResult | InsertResult>}
     */
    save(document: TDocument | Partial<TDocument>): Promise<UpdateResult | InsertResult<TDocument>> {
        ok(document && typeof document === 'object', 'Collection.save(document) require an object or an instance of SchemaDocument.');
    
        let prepared: TDocument = document as TDocument;
        if (false === document instanceof SchemaDocument) {
            prepared = this.factory(document);
        }
        
        if (prepared._id) {
            const update = prepared.toObject();
            return this.updateOne(prepared, {
                $set: Object.assign(
                    {},
                    ...Object.keys(update)
                        .filter(key => key !== '_id')
                        .map(key => ({[key]: update[key]}))
                )
            });
        }

        return this.insertOne(prepared);
    }
    
    /**
     * @param pipeline
     * @param options
     * @returns {undefined}
     */
    aggregate(pipeline: Object[], options?: MongoDb.CollectionAggregationOptions) {
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
        return this.queue(collection => collection.count(this.normalizeQuery(query), options));
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
        return this.queue(async (collection): Promise<DeleteResult> =>
            new DeleteResult(await collection.deleteMany(this.normalizeQuery(filter), options))
        );
    }
    
    /**
     * @param filter
     * @param options
     */
    deleteOne(filter: Object | SchemaDocument, options?: { w?: number | string, wtimmeout?: number, j?: boolean, bypassDocumentValidation?: boolean }) {
        return this.queue(async (collection): Promise<DeleteResult> => {
            if (filter instanceof SchemaDocument) {
                const listener = filter.getEventListener();
                listener.emit(Events.beforeDelete);
                const deleteResult = new DeleteResult(await collection.deleteOne(this.filter(filter), options));
                listener.emit(Events.afterDelete);
                
                return deleteResult;
            }
            
            return new DeleteResult(await collection.deleteOne(filter, options));
        });
    }
    
    /**
     * @param key
     * @param query
     * @param options
     */
    distinct(key: string, query: Object, options?: { readPreference?: MongoDb.ReadPreference | string }) {
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
        return this.queue((collection): Cursor<TDocument> =>
            new Cursor<TDocument>(
                collection.find(this.normalizeQuery(query)),
                (document) => this.factory(document)
            )
        );
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
            return new FindAndModifyResult({lastErrorObject: result.lastErrorObject, value: result.value, factory: (d: Partial<TDocument>) => this.factory(d)});
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
            return new FindAndModifyResult({lastErrorObject: result.lastErrorObject, value: result.value, factory: (d: Partial<TDocument>) => this.factory(d)});
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
            return new FindAndModifyResult({lastErrorObject: result.lastErrorObject, value: result.value, factory: (d: Partial<TDocument>) => this.factory(d)});
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
    insertMany(docs: Array<Partial<TDocument> | TDocument>, options?: MongoDb.CollectionInsertManyOptions) {
        return this.queue(async (collection): Promise<Array<InsertResult<TDocument>>> => {
            const documents = docs.map(doc => doc instanceof SchemaDocument ? doc : this.factory(doc));
            const listeners = documents.map(doc => doc.getEventListener());

            listeners.forEach(listener => listener.emit(Events.beforeInsert));
            const result = await collection.insertMany(documents.map(doc => this.createObjectReference(doc)), options);
            return result.ops.map(res => {
                const inertResult = new InsertResult({insertedId: res._id}, res.unref());
                listeners.map(listener => listener.emit(Events.afterInsert));
                return inertResult;
            })
        });
    }
    
    /**
     * @param document
     * @param options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    insertOne(document: Partial<TDocument> | TDocument, options?: MongoDb.CollectionInsertOneOptions) {
        return this.queue(async (collection): Promise<InsertResult<TDocument>> => {
            let prepared: TDocument;
            if (document instanceof SchemaDocument) {
                prepared = document;
            } else {
                prepared = this.factory(document);
            }
            
            const listener = prepared.getEventListener();
            listener.emit(Events.beforeInsert);
            const insertResult = new InsertResult(await collection.insertOne(prepared.toObject(), options), prepared);
            listener.emit(Events.afterInsert);
            return insertResult;
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
    updateMany(filter: Object, update: Object, options?: Object): Promise<UpdateResult> {
        return this.queue(async (collection): Promise<UpdateResult> => {
            return new UpdateResult(await collection.updateMany(this.normalizeQuery(filter), update, options));
        });
    }
    
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateOne(filter: Object | SchemaDocument, update: Object, options?: Object): Promise<UpdateResult> {
        return this.queue(async (collection): Promise<UpdateResult> => {
            if (filter instanceof SchemaDocument) {
                const listener = filter.getEventListener();
                listener.emit(Events.beforeUpdate);
                const updateResult = new UpdateResult(await collection.updateOne(this.filter(filter), update, options));
                listener.emit(Events.afterUpdate);
                
                return updateResult;
            }
            
            return new UpdateResult(await collection.updateOne(this.filter(filter), update, options));
        });
    }
}

export {Collection};
