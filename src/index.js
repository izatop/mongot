"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const connection_1 = require("./connection");
exports.Connection = connection_1.Connection;
const collection_1 = require("./collection");
exports.Collection = collection_1.Collection;
class Repository {
    constructor(uri, options) {
        this.state = connection_1.Connection.connect(uri, options);
    }
    get(collection) {
        return new collection(this.state);
    }
    destroy() {
        return this.state.then(connection => connection.disconnect(), error => error);
    }
}
exports.Repository = Repository;
__export(require("./document"));
__export(require("./schema"));
__export(require("./cursor"));
//# sourceMappingURL=index.js.map