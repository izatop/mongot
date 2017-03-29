"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const store_1 = require("./metadata/store");
const mutation_1 = require("./metadata/mutation");
const schema_1 = require("./schema");
const identifiers = new WeakMap();
const values = new WeakMap();
exports.PRIMARY_KEY_NAME = '_id';
class TypeCast {
    static cast(type, value, proto) {
        if (typeof value === "undefined" || value === null) {
            return value;
        }
        switch (type) {
            case schema_1.ObjectID:
                return new schema_1.ObjectID(value);
            case String:
                return TypeCast.castToString(value);
            case Number:
                return TypeCast.castToNumber(value);
            case Date:
                return TypeCast.castToDate(value);
            case Boolean:
                return TypeCast.castToBoolean(value);
            case SchemaArray:
                return TypeCast.castToArray(type, proto, value);
            case SchemaFragmentArray:
                return TypeCast.castToFragmentArray(type, proto, value);
            case SchemaFragment:
                return TypeCast.castToFragment(proto, value);
            case Buffer:
                return value;
            case Object:
                return value;
        }
    }
    static toPlainValue(value) {
        switch (typeof value) {
            case 'object': {
                if (value === null) {
                    return value;
                }
                if (value instanceof schema_1.ObjectID) {
                    return value.toString();
                }
                if (value instanceof SchemaMetadata) {
                    return value.toObject();
                }
                if (value instanceof SchemaArray) {
                    return value.toArray();
                }
                if (Array.isArray(value)) {
                    return value.map(x => TypeCast.toPlainValue(x));
                }
                if (Object.prototype.toString.call(value) === '[object Object]') {
                    return Object.assign({}, ...Object.keys(value)
                        .map(key => ({ [key]: TypeCast.toPlainValue(value[key]) })));
                }
                else {
                    return value;
                }
            }
            default:
                return value;
        }
    }
    static castToArray(type, proto, value) {
        assert_1.ok(true === Array.isArray(value), `${type.name} need an array value for constructor given ${value.toString()}.`);
        return new type(value, x => TypeCast.cast(proto, x));
    }
    static castToFragmentArray(type, proto, value) {
        assert_1.ok(true === Array.isArray(value), `${type.name} need an array value for constructor given ${value.toString()}.`);
        return new type(value, x => TypeCast.cast(SchemaFragment, x, proto));
    }
    static castToFragment(proto, value) {
        return proto.factory(value);
    }
    static castToBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        switch (value) {
            case '':
            case '0':
            case 'false':
            case null:
            case false:
                return false;
            case '1':
            case 'true':
            case true:
                return true;
        }
        return !!value;
    }
    static castToDate(value) {
        if (value instanceof Date) {
            return value;
        }
        return new Date(value);
    }
    static castToString(value) {
        if (typeof value === 'string') {
            return value;
        }
        return String(value);
    }
    static castToNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        const normalized = Number(value);
        return false === isNaN(normalized) ? normalized : 0;
    }
}
exports.TypeCast = TypeCast;
class SchemaMetadata extends mutation_1.SchemaMutate {
    constructor(document) {
        super(document);
        const metadata = this.getMetadata();
        assert_1.ok(!!metadata, `Metadata doesn't exists for ${this.constructor.name}`);
        let _id = undefined;
        if (typeof document === 'object' && document !== null) {
            _id = document[exports.PRIMARY_KEY_NAME];
        }
        values.set(this, {});
        identifiers.set(this, _id);
        // Shadow setter for _id
        Object.defineProperty(this, Symbol.for(exports.PRIMARY_KEY_NAME), {
            value: (_id) => identifiers.set(this, _id),
            writable: false,
            enumerable: false,
            configurable: false
        });
        Object.defineProperty(this, exports.PRIMARY_KEY_NAME, {
            get() {
                return identifiers.get(this);
            },
            enumerable: true,
            configurable: false
        });
        metadata.forEach(({ type, proto }, key) => {
            Object.defineProperty(this, key, {
                get: () => values.get(this)[key],
                set: (newValue) => {
                    values.get(this)[key] = TypeCast.cast(type, newValue, proto);
                },
                enumerable: true,
                configurable: false
            });
        });
    }
    __mutate(document) {
        assert_1.ok(typeof document && document !== null, `${this.constructor.name} an unexpected document type ${typeof document}`);
        const properties = Object.assign({}, this.toObject(), document);
        if (properties._id) {
            let { _id } = properties;
            if (typeof _id === 'string') {
                _id = schema_1.ObjectID.createFromHexString(_id);
            }
            else if (false === _id instanceof schema_1.ObjectID) {
                throw new Error(`Cannot convert "${_id}" to ObjectID`);
            }
            identifiers.set(this, _id);
        }
        Object.keys(properties)
            .filter(field => field !== exports.PRIMARY_KEY_NAME)
            .forEach(key => {
            if (!Object.getOwnPropertyDescriptor(this, key)) {
                // @TODO Add strict checking for skipped properties
                // throw new Error(`Schema ${this.constructor.name} unknown property: ${key}`);
                return;
            }
            this[key] = properties[key];
        });
        return this;
    }
    getMetadata() {
        return store_1.MetadataStore.getSchemaMetadata((this['constructor']));
    }
    getDefinedHooks() {
        return store_1.MetadataStore.getSchemaHookMetadata((this['constructor']));
    }
    toObject() {
        const properties = [];
        Object.keys(this)
            .forEach(key => {
            if (typeof this[key] !== 'undefined') {
                properties.push({ [key]: TypeCast.toPlainValue(this[key]) });
            }
        });
        return Object.assign({}, ...properties);
    }
    toJSON() {
        return this.toObject();
    }
    static factory(document) {
        return new this().__mutate(document);
    }
}
exports.SchemaMetadata = SchemaMetadata;
class SchemaDocument extends SchemaMetadata {
    call(hook, collection) {
        const definedHooks = this.getDefinedHooks();
        if (definedHooks && definedHooks.has(hook)) {
            return Promise.all(definedHooks.get(hook).map(property => this[property](collection)));
        }
        return Promise.resolve([]);
    }
}
exports.SchemaDocument = SchemaDocument;
class SchemaFragment extends SchemaMetadata {
}
exports.SchemaFragment = SchemaFragment;
class PartialDocumentFragment extends SchemaMetadata {
    __mutate(document) {
        assert_1.ok(typeof document && document !== null, `${this.constructor.name} an unexpected document type ${typeof document}`);
        let _a = Object.assign({}, this.toObject(), document), { _id } = _a, properties = __rest(_a, ["_id"]);
        if (typeof _id === 'string') {
            _id = schema_1.ObjectID.createFromHexString(_id);
        }
        else if (false === _id instanceof schema_1.ObjectID) {
            throw new Error(`Cannot convert "${_id}" to ObjectID`);
        }
        identifiers.set(this, _id);
        Object.assign(this, properties);
        return this;
    }
    getMetadata() {
        return new Map();
    }
}
exports.PartialDocumentFragment = PartialDocumentFragment;
class SchemaArray extends Array {
    constructor(values, cast) {
        super();
        this.cast = cast ? cast : x => x;
        if (values && typeof values === 'object') {
            [...values].forEach(value => this.push(value));
        }
    }
    toArray() {
        return [...this].map(value => TypeCast.toPlainValue(value));
    }
    toJSON() {
        return this.toArray();
    }
    push(...items) {
        return super.push(...items.map(this.cast));
    }
    unshift(...items) {
        return super.unshift(...items.map(this.cast));
    }
    pull(value) {
        let index = this.indexOf(value);
        if (index !== -1) {
            this.splice(index, 1);
        }
    }
}
exports.SchemaArray = SchemaArray;
class SchemaFragmentArray extends SchemaArray {
    search(id) {
        let _id = TypeCast.cast(schema_1.ObjectID, id);
        return this.filter(x => x._id.equals(_id))
            .shift();
    }
}
exports.SchemaFragmentArray = SchemaFragmentArray;
//# sourceMappingURL=document.js.map