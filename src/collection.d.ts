import * as MongoDb from 'mongodb';
import { SchemaDocument } from "./document";
import { Cursor } from "./cursor";
import { Connection } from "./connection";
import { InsertResult, DeleteResult, UpdateResult, FindAndModifyResult } from "./collection/helpers";
export declare type Partial<T> = Object;
declare class Collection<TDocument extends SchemaDocument> {
    private readonly construct;
    private readonly state;
    private readonly name;
    readonly connection: Promise<Connection>;
    constructor(connection: Promise<Connection>, name?: string, options?: MongoDb.CollectionOptions | MongoDb.CollectionCreateOptions, construct?: typeof SchemaDocument);
    readonly collection: PromiseLike<MongoDb.Collection>;
    /**
     * @param fn
     * @returns {any}
     */
    private queue<T>(fn);
    private filter(filter);
    private normalizeQuery(query);
    /**
     * @param document
     * @returns {TDocument}
     */
    factory(document?: Partial<TDocument>): TDocument;
    /**
     * @param document
     * @returns {Promise<UpdateResult | InsertResult>}
     */
    save(document: TDocument | Partial<TDocument>): Promise<UpdateResult | InsertResult<TDocument>>;
    /**
     * @param pipeline
     * @param options
     * @returns {undefined}
     */
    aggregate(pipeline: Object[], options?: MongoDb.CollectionAggregationOptions): Promise<MongoDb.AggregationCursor>;
    /**
     * @param operations
     * @param options
     * @returns {undefined}
     */
    bulkWrite<TResult extends MongoDb.BulkWriteResult>(operations: Object[], options: MongoDb.CollectionBluckWriteOptions): Promise<TResult>;
    /**
     * @param query
     * @param options
     * @returns {undefined}
     */
    count(query: Object, options: MongoDb.MongoCountPreferences): Promise<number>;
    /**
     * @param fieldOrSpec
     * @param options
     * @returns void
     */
    createIndex(fieldOrSpec: string | any, options: MongoDb.IndexOptions): Promise<string>;
    /**
     * @param indexSpecs
     * @returns void
     */
    createIndexes(indexSpecs: Object[]): Promise<any>;
    /**
     * @param filter
     * @param options
     */
    deleteMany(filter: Object, options?: MongoDb.CollectionOptions): Promise<DeleteResult>;
    /**
     * @param filter
     * @param options
     */
    deleteOne(filter: Object | SchemaDocument, options?: {
        w?: number | string;
        wtimmeout?: number;
        j?: boolean;
        bypassDocumentValidation?: boolean;
    }): Promise<DeleteResult>;
    /**
     * @param key
     * @param query
     * @param options
     */
    distinct(key: string, query: Object, options?: {
        readPreference?: MongoDb.ReadPreference | string;
    }): Promise<any>;
    /**
     * @TODO
     */
    drop(): Promise<any>;
    /**
     * @TODO
     */
    dropIndex(indexName: string, options?: MongoDb.CollectionOptions): Promise<any>;
    /**
     * @TODO
     */
    dropIndexes(): Promise<any>;
    /**
     * @param query
     * @returns {Cursor<TDocument>}
     */
    find(query?: Object): Promise<Cursor<TDocument>>;
    /**
     * @param query
     * @param options
     * @returns {Promise<TDocument>}
     */
    findOne(query?: Object, options?: {
        sort: Object;
    }): Promise<TDocument>;
    /**
     * @param filter
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndDelete(filter: Object, options?: {
        projection?: Object;
        sort?: Object;
        maxTimeMS?: number;
    }): Promise<FindAndModifyResult<TDocument>>;
    /**
     * @param filter
     * @param replacement
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndReplace(filter: Object, replacement: Object, options?: MongoDb.FindOneAndReplaceOption): Promise<FindAndModifyResult<TDocument>>;
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<FindAndModifyResult<TDocument>>}
     */
    findOneAndUpdate(filter: Object, update: Object, options?: MongoDb.FindOneAndReplaceOption): Promise<FindAndModifyResult<TDocument>>;
    /**
     * @TODO Update returns definitions.
     *
     * @param x
     * @param y
     * @param options
     * @returns {Promise<{results: any[]}>}
     */
    geoHaystackSearch(x: number, y: number, options?: MongoDb.GeoHaystackSearchOptions): Promise<{
        results: any[];
    }>;
    /**
     * @TODO Update returns definitions.
     *
     * @param x
     * @param y
     * @param options
     * @returns {Promise<{results: any[]}>}
     */
    geoNear(x: number, y: number, options?: MongoDb.GeoNearOptions): Promise<{
        results: any[];
    }>;
    /**
     * @TODO
     */
    indexes(): Promise<any>;
    /**
     * @TODO
     */
    indexExists(indexes: string | string[]): Promise<boolean>;
    /**
     * @TODO
     */
    indexInformation(options?: {
        full: boolean;
    }): Promise<any>;
    /**
     * @TODO
     */
    initializeOrderedBulkOp(options?: MongoDb.CollectionOptions): Promise<MongoDb.OrderedBulkOperation>;
    /**
     * @TODO
     */
    initializeUnorderedBulkOp(options?: MongoDb.CollectionOptions): Promise<MongoDb.UnorderedBulkOperation>;
    private createObjectReference(doc);
    /**
     * @TODO Mutate result
     *
     * @param docs
     * @param options
     * @returns {Promise<InsertWriteOpResult>}
     */
    insertMany(docs: Array<Partial<TDocument> | TDocument>, options?: MongoDb.CollectionInsertManyOptions): Promise<InsertResult<TDocument>[]>;
    /**
     * @param document
     * @param options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    insertOne(document: Partial<TDocument> | TDocument, options?: MongoDb.CollectionInsertOneOptions): Promise<InsertResult<TDocument>>;
    /**
     * @TODO
     */
    isCapped(): Promise<any>;
    /**
     * @TODO
     */
    listIndexes(options?: {
        batchSize?: number;
        readPreference?: MongoDb.ReadPreference | string;
    }): Promise<MongoDb.CommandCursor>;
    /**
     * @TODO
     */
    mapReduce<TResult>(map: Function | string, reduce: Function | string, options?: MongoDb.MapReduceOptions): Promise<TResult>;
    /**
     * @TODO
     */
    options(): Promise<any>;
    /**
     * @TODO
     */
    parallelCollectionScan(options?: MongoDb.ParallelCollectionScanOptions): Promise<MongoDb.Cursor[]>;
    /**
     * @TODO
     */
    reIndex(): Promise<any>;
    /**
     * @TODO
     */
    rename(newName: string, options?: {
        dropTarget?: boolean;
    }): Promise<MongoDb.Collection>;
    /**
     * @TODO Update returns definitions.
     *
     * @param filter
     * @param doc
     * @param options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    replaceOne(filter: Object, doc: Object, options?: MongoDb.ReplaceOneOptions): Promise<MongoDb.UpdateWriteOpResult>;
    /**
     * @TODO
     */
    stats(options?: {
        scale: number;
    }): Promise<MongoDb.CollStats>;
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateMany(filter: Object, update: Object, options?: Object): Promise<UpdateResult>;
    /**
     * @param filter
     * @param update
     * @param options
     * @returns {Promise<Promise<UpdateWriteOpResult>>}
     */
    updateOne(filter: Object | SchemaDocument, update: Object, options?: Object): Promise<UpdateResult>;
}
export { Collection };
