import * as MongoDb from 'mongodb';
import {SchemaDocument, PRIMARY_KEY_NAME} from "../document";
import {Collection} from "../collection";
import {ObjectID} from "../schema";

export class UpdateResult {
    readonly matched: number;
    readonly modified: number;
    readonly upserted: number;
    readonly upsertedId: ObjectID;

    constructor({matchedCount, modifiedCount, upsertedCount, upsertedId}: MongoDb.UpdateWriteOpResult) {
        this.matched = matchedCount;
        this.modified = modifiedCount;
        this.upserted = upsertedCount;
        if (upsertedId) {
            this.upsertedId = upsertedId._id;
        }
    }
}

export class InsertResult<TDocument extends SchemaDocument> {
    readonly insertedId: ObjectID;
    readonly ref: TDocument;

    constructor({insertedId}: {insertedId: ObjectID}, document: TDocument) {
        this.insertedId = insertedId;
        this.ref = document;
        this.ref[Symbol.for(PRIMARY_KEY_NAME)] = this.insertedId;
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
    private readonly ref: TDocument = null;

    constructor({lastErrorObject, factory, value}: {lastErrorObject: Object, factory: (document?: Object) => TDocument, value?: Object}) {
        this.lastError = lastErrorObject;
        if (!!value) {
            this.ref = factory(value);
        }
    }

    has(): boolean {
        return !!this.ref;
    }

    get(): TDocument {
        return this.ref;
    }
}

export const createNextAutoIncrementNumber = async <T extends SchemaDocument>(collection: Collection<T>): Promise<number> => {
    const {db} = await collection.connection;
    const res = await db.collection('mongot.counter').findOneAndUpdate(
        {
            _id: collection.name
        },
        {
            $inc: {seq: 1}
        },
        {
            upsert: true,
            returnOriginal: false
        }
    );

    return res.value.seq as number;
};
