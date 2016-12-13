import * as MongoDb from 'mongodb';
import { Connection } from "./connection";
import { Collection } from "./collection";
import { SchemaDocument } from "./document";
declare class Repository {
    readonly state: Promise<Connection>;
    constructor(uri: string, options?: MongoDb.MongoClientOptions);
    get<D extends SchemaDocument, F extends Collection<D>>(collection: {
        new (...args: any[]): F;
    }): F;
    destroy(): Promise<any>;
}
export { Repository };
export { Connection };
export { Collection };
export * from './document';
export * from './schema';
export * from './cursor';
