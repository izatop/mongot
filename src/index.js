"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
class Repository {
    constructor(uri, options) {
        this.state = connection_1.Connection.connect(uri, options);
    }
    get(collection) {
        return new collection(this.state);
    }
    destroy() {
        return this.state.then((connection) => connection.disconnect(), error => error);
    }
}
exports.Repository = Repository;
__export(require("./connection"));
__export(require("./collection"));
__export(require("./collection/helpers"));
__export(require("./document"));
__export(require("./schema"));
__export(require("./cursor"));
//# sourceMappingURL=index.js.map