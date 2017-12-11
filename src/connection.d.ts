import * as MongoDb from 'mongodb';
import { Repository } from "./repository";
export declare class Connection {
    readonly db: MongoDb.Db;
    readonly context: Repository;
    private constructor();
    create(name: string, options?: MongoDb.CollectionCreateOptions): Promise<MongoDb.Collection>;
    get(name: string, options?: MongoDb.DbCollectionOptions): Promise<MongoDb.Collection>;
    disconnect(): Promise<void>;
    static connect(context: Repository, uri: string, options?: MongoDb.MongoClientOptions): Promise<Connection>;
}
