"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
class Repository {
    constructor(uri, options) {
        this.state = connection_1.Connection.connect(this, uri, options);
    }
    get(collection) {
        return new collection(this.state);
    }
    destroy() {
        return this.state.then((connection) => connection.disconnect(), error => error);
    }
}
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map