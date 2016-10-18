import * as MongoDb from 'mongodb';
import {Connection} from "./connection";
import {Collection} from "./collection";
import {SchemaDocument} from "./document";

class Repository {
    readonly state: Promise<Connection>;
    
    constructor(uri: string, options?: MongoDb.MongoClientOptions) {
        this.state = Connection.connect(uri, options);
    }
    
    get<D extends SchemaDocument, F extends Collection<D>>(collection: {new(...args:any[]): F}) {
        return new collection(this.state);
    }
    
    destroy() {
        return this.state.then(connection => connection.disconnect(), error => error);
    }
}

export {Repository};
export {Connection};
export {Collection};

export * from './document';
export * from './schema';
export * from './cursor';
