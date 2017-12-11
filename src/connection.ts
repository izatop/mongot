import * as MongoDb from 'mongodb';
import {Repository} from "./repository";

export class Connection {
    private constructor(
        public readonly db: MongoDb.Db,
        public readonly context: Repository
    ) {}
    
    create(name: string, options?: MongoDb.CollectionCreateOptions): Promise<MongoDb.Collection> {
        return this.db.createCollection(name, options);
    }
    
    get(name: string, options?: MongoDb.DbCollectionOptions): Promise<MongoDb.Collection> {
        return new Promise((resolve, reject) => {
            this.db.collection(name, Object.assign({}, options, {strict: true}), (error, collection) => {
                if (error) {
                    this.db.createCollection(name, Object.assign({}, options, {strict: true}))
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve(collection);
                }
            });
        });
    }
    
    disconnect(): Promise<void> {
        if (this.db) {
            return this.db.close();
        }
        
        return Promise.resolve();
    }
    
    static connect(context: Repository, uri: string, options?: MongoDb.MongoClientOptions): Promise<Connection> {
        if (process.env.hasOwnProperty('MONGODB_DEBUG')) {
            (<{Logger: {setLevel(level:string)}}> <any> MongoDb).Logger.setLevel('debug');
        }
        
        return new Promise((resolve, reject) => {
            const callback: MongoDb.MongoCallback<MongoDb.Db> = (error, db) => {
                error ? reject(error) : resolve(new Connection(db, context));
            };
            
            MongoDb.MongoClient.connect(uri, options, callback);
        })
    }
}
