import * as MongoDb from 'mongodb';
import { SchemaDocument } from "../document";
export declare class UpdateResult {
    readonly matched: number;
    readonly modified: number;
    readonly upserted: number;
    readonly upsertedId: MongoDb.ObjectID;
    constructor({matchedCount, modifiedCount, upsertedCount, upsertedId}: MongoDb.UpdateWriteOpResult);
}
export declare class InsertResult<TDocument extends SchemaDocument> {
    readonly insertedId: MongoDb.ObjectID;
    readonly ref: TDocument;
    constructor({insertedId}: {
        insertedId: MongoDb.ObjectID;
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
