import * as MongoDb from 'mongodb';
import { SchemaDocument } from "../document";
import { Collection } from "../collection";
import { ObjectID } from "../schema";
export declare class UpdateResult {
    readonly matched: number;
    readonly modified: number;
    readonly upserted: number;
    readonly upsertedId: ObjectID;
    constructor({matchedCount, modifiedCount, upsertedCount, upsertedId}: MongoDb.UpdateWriteOpResult);
}
export declare class InsertResult<TDocument extends SchemaDocument> {
    readonly insertedId: ObjectID;
    readonly ref: TDocument;
    constructor({insertedId}: {
        insertedId: ObjectID;
    }, document: TDocument);
}
export declare class DeleteResult {
    count: number;
    constructor({deletedCount}: {
        deletedCount?: number;
    });
}
export declare class FindAndModifyResult<TDocument extends SchemaDocument> {
    readonly lastError: Object;
    private readonly ref;
    constructor({lastErrorObject, factory, value}: {
        lastErrorObject: Object;
        factory: (document?: Object) => TDocument;
        value?: Object;
    });
    has(): boolean;
    get(): TDocument;
}
export declare const createNextAutoIncrementNumber: <T extends SchemaDocument>(collection: Collection<T>) => Promise<number>;
