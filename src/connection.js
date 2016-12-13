"use strict";
const MongoDb = require("mongodb");
class Connection {
    constructor(db) {
        this.db = db;
    }
    create(name, options) {
        return this.db.createCollection(name, options);
    }
    get(name, options) {
        return new Promise((resolve, reject) => {
            this.db.collection(name, Object.assign({}, options, { strict: true }), (error, collection) => {
                if (error) {
                    this.db.createCollection(name, Object.assign({}, options, { strict: true }))
                        .then(resolve)
                        .catch(reject);
                }
                else {
                    resolve(collection);
                }
            });
        });
    }
    disconnect() {
        if (this.db) {
            return this.db.close();
        }
        return Promise.resolve();
    }
    static connect(uri, options) {
        if (process.env.hasOwnProperty('MONGODB_DEBUG')) {
            MongoDb.Logger.setLevel('debug');
        }
        return new Promise((resolve, reject) => {
            const callback = (error, db) => {
                error ? reject(error) : resolve(new Connection(db));
            };
            MongoDb.MongoClient.connect(uri, options, callback);
        });
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map