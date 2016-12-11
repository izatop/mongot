import * as MongoDb from 'mongodb';
export declare class Connection {
    readonly db: MongoDb.Db;
    private constructor(db);
    create(name: string, options?: MongoDb.CollectionCreateOptions): Promise<MongoDb.Collection>;
    get(name: string, options?: MongoDb.DbCollectionOptions): Promise<MongoDb.Collection>;
    disconnect(): Promise<void>;
    static connect(uri: string, options?: MongoDb.MongoClientOptions): Promise<Connection>;
}
