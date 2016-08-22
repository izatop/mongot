import * as MongoDb from 'mongodb';
import {SchemaDocument} from "../document";

export class UpdateResult<TDocument extends SchemaDocument> {
    readonly matched: number;
    readonly modified: number;
    readonly upserted: number;
    readonly upsertedId: MongoDb.ObjectID;
    
    constructor({matchedCount, modifiedCount, upsertedCount, upsertedId}: MongoDb.UpdateWriteOpResult) {
        this.matched = matchedCount;
        this.modified = modifiedCount;
        this.upserted = upsertedCount;
        this.upsertedId = new MongoDb.ObjectID(upsertedId._id.toString());
    }
}

export class InsertResult<TDocument extends SchemaDocument> {
    readonly insertedId: MongoDb.ObjectID;
    readonly ref: TDocument;
    
    constructor({insertedId}: {insertedId: MongoDb.ObjectID}, document: TDocument) {
        this.insertedId = new MongoDb.ObjectID(insertedId.toString());
        this.ref = document;
        this.ref[Symbol.for('id')] = this.insertedId;
    }
}

export class DeleteResult {
    count: number;
    
    constructor({deletedCount}: {deletedCount?: number}) {
        this.count = deletedCount;
    }
}

export class FindAndModifyResult<TDocument extends SchemaDocument> {
    readonly lastError: Object;
    private readonly ref;
    
    constructor({lastErrorObject, factory, value}: {lastErrorObject: Object, factory: (document?: Object) => TDocument, value?: Object}) {
        this.lastError = lastErrorObject;
        this.ref = value ? factory(value) : null;
    }
    
    has(): boolean {
        return !!this.ref;
    }
    
    get(): TDocument {
        return this.ref;
    }
}