"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const store_1 = require("./metadata/store");
class Query {
    constructor(target, query) {
        this.meta = store_1.MetadataStore.getSchemaMetadata((target.prototype.constructor));
        this.query = query && typeof query === 'object' ? query : {};
    }
    normalize(value) {
        if (typeof value === 'object' && value !== null) {
            if (value instanceof schema_1.ObjectID || value instanceof schema_1.Long) {
                return value;
            }
            else if (Array.isArray(value)) {
                return value.map(x => this.normalize(x));
            }
            else if (value instanceof Date) {
                return value;
            }
            else if (Object.prototype.toString.call(value) === '[object Object]') {
                return this.format(value);
            }
            return value;
        }
        else if (typeof value === 'string') {
            if (value.length === 24) {
                if ('Z' === value.substr(-1) && true === /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                    return new Date(value);
                }
                else if (true === /^[0-9a-f]{24}$/.test(value)) {
                    return schema_1.ObjectID.createFromHexString(value);
                }
            }
            return value;
        }
        return value;
    }
    format(query) {
        const data = query || this.query;
        return Object.assign({}, ...Object.keys(data).map(key => ({ [key]: this.normalize(data[key]) })));
    }
}
exports.Query = Query;
//# sourceMappingURL=query.js.map