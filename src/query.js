"use strict";
const mongodb_1 = require("mongodb");
const store_1 = require("./metadata/store");
class Query {
    constructor(target, query) {
        this.meta = store_1.MetadataStore.getSchemaMetadata((target.prototype.constructor));
        this.query = query && typeof query === 'object' ? query : {};
    }
    normalize(value) {
        if (typeof value === 'object' && value !== null) {
            if (value instanceof mongodb_1.ObjectID) {
                return value;
            }
            if (Array.isArray(value)) {
                return value.map(x => this.normalize(x));
            }
            return this.format(value);
        }
        else if (typeof value === 'string' && value.length === 24 && /^[0-9a-f]{24}$/.test(value) === true) {
            return mongodb_1.ObjectID.createFromHexString(value);
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