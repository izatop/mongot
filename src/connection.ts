import * as MongoDb from 'mongodb';

export class Connection {
    public readonly db: MongoDb.Db;
    
    private constructor(db: MongoDb.Db) {
        this.db = db;
    }
    
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
        return this.db.close();
    }
    
    static connect(uri: string, options?: MongoDb.MongoClientOptions): Promise<Connection> {
        if (process.env.hasOwnProperty('MONGODB_DEBUG')) {
            (<{Logger: {setLevel(level:string)}}> <any> MongoDb).Logger.setLevel('debug');
        }
        
        return new Promise((resolve, reject) => {
            MongoDb.MongoClient.connect(uri, options, (error, db) => {
                error ? reject(error) : resolve(new Connection(db));
            });
        })
    }
}
