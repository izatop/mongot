"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
exports.default = (db = 'test') => new index_1.Repository('mongodb://localhost/'.concat(db));
//# sourceMappingURL=connect.js.map