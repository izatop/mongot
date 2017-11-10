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
const merge = require("merge");
const store_1 = require("./metadata/store");
const mutation_1 = require("./metadata/mutation");
const schema_1 = require("./schema");
exports.PRIMARY_KEY_NAME = '_id';
class TypeCast {
    static cast(type, value, proto) {
        if (typeof value === "undefined" || value === null) {
            return value;
        }
        switch (type) {
            case schema_1.ObjectID:
                return new schema_1.ObjectID(value);
            case schema_1.Long:
                if (value instanceof schema_1.Long) {
                    return value;
                }
                if (typeof value === 'number') {
                    return schema_1.Long.fromNumber(value);
                }
                else if (typeof value === 'string') {
                    return schema_1.Long.fromString(value);
                }
                else if (typeof value === 'object' && '_bsontype' in value) {
                    return schema_1.Long.fromBits(value['low_'], value['high_']);
                }
                // @TODO Think how to do with that unexpected behavior
                return null;
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
                if (value instanceof schema_1.Long) {
                    return value.toJSON();
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
    static extract(value) {
        switch (typeof value) {
            case 'object': {
                if (value === null) {
                    return value;
                }
                if (value instanceof schema_1.ObjectID || value instanceof schema_1.Long) {
                    return value;
                }
                if (value instanceof SchemaMetadata) {
                    return value.extract();
                }
                if (value instanceof SchemaArray) {
                    return [...value].map(v => TypeCast.extract(v));
                }
                if (Array.isArray(value)) {
                    return value.map(x => TypeCast.extract(x));
                }
                if (Object.prototype.toString.call(value) === '[object Object]') {
                    return Object.assign({}, ...Object.keys(value)
                        .filter(key => typeof value[key] !== 'undefined')
                        .map(key => ({ [key]: TypeCast.extract(value[key]) })));
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
const store = new WeakMap();
const getStore = ctx => {
    if (false === store.has(ctx)) {
        store.set(ctx, {}).get(ctx);
    }
    return store.get(ctx);
};
class SchemaMetadata extends mutation_1.SchemaMutate {
    constructor(document) {
        super(document);
        const metadata = this.getMetadata();
        assert_1.ok(!!metadata, `Metadata doesn't exists for ${this.constructor.name}`);
        const values = getStore(this);
        let _id = undefined;
        if (typeof document === 'object' && document !== null) {
            /**
             * _id must be undefined if given empty value
             * @see https://github.com/izatop/mongot/issues/3
            */
            _id = document[exports.PRIMARY_KEY_NAME] || undefined;
        }
        Object.defineProperty(this, Symbol.for(exports.PRIMARY_KEY_NAME), {
            set(v) {
                values[exports.PRIMARY_KEY_NAME] = TypeCast.cast(schema_1.ObjectID, v);
            },
            enumerable: false,
            configurable: false
        });
        Object.defineProperty(this, exports.PRIMARY_KEY_NAME, {
            get() {
                return values[exports.PRIMARY_KEY_NAME];
            },
            enumerable: true,
            configurable: false
        });
        metadata.forEach(({ type, proto }, key) => {
            Object.defineProperty(this, key, {
                get() {
                    return values[key];
                },
                set(newValue) {
                    values[key] = TypeCast.cast(type, newValue, proto);
                },
                enumerable: true,
                configurable: false
            });
        });
    }
    __mutate(document) {
        assert_1.ok(typeof document && document !== null, `${this.constructor.name} an unexpected document type ${typeof document}`);
        const properties = Object.assign({}, this.extract(), document);
        if (properties[exports.PRIMARY_KEY_NAME]) {
            let _id = properties[exports.PRIMARY_KEY_NAME];
            if (typeof _id === 'string') {
                _id = schema_1.ObjectID.createFromHexString(_id);
            }
            else if (false === _id instanceof schema_1.ObjectID) {
                throw new Error(`Cannot convert "${_id}" to ObjectID`);
            }
            this[Symbol.for(exports.PRIMARY_KEY_NAME)] = _id;
        }
        Object.keys(properties)
            .filter(field => field !== exports.PRIMARY_KEY_NAME)
            .forEach(key => {
            if (!Object.getOwnPropertyDescriptor(this, key)) {
                // @TODO Add checks for virtual properties and some meta
                // throw new Error(`Schema ${this.constructor.name} unknown property: ${key}`);
                // console.error(`Schema ${this.constructor.name} has unknown property: ${key}`);
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
        store_1.MetadataStore.getSchemaVirtualMetadata((this['constructor']))
            .forEach(key => properties.push({ [key]: this[key] }));
        return Object.assign({}, ...properties);
    }
    toJSON() {
        return this.toObject();
    }
    clone() {
        const cloned = this.toObject();
        if (cloned._id) {
            delete cloned._id;
        }
        const constructor = this.constructor;
        return new constructor().__mutate(cloned);
    }
    extract() {
        const properties = [];
        Object.keys(this)
            .forEach(key => {
            if (typeof this[key] !== 'undefined') {
                properties.push({ [key]: TypeCast.extract(this[key]) });
            }
        });
        return Object.assign({}, ...properties);
    }
    merge(data) {
        let source = data;
        if (data instanceof SchemaMetadata) {
            source = data.toObject();
        }
        const keys = new Set(Object.keys(source));
        const metadata = this.getMetadata();
        metadata.forEach(({ type, proto }, key) => {
            if (keys.has(key)) {
                if (type === Object) {
                    this[key] = merge({}, this[key], source[key]);
                }
                else if (typeof this[key] === 'undefined' || this[key] === null) {
                    this[key] = TypeCast.cast(type, source[key], proto);
                }
                else if (type === SchemaFragment) {
                    this[key].merge(source[key]);
                }
                else {
                    this[key] = source[key];
                }
            }
        });
        return this;
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
        this[Symbol.for(exports.PRIMARY_KEY_NAME)] = _id;
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
        Reflect.defineProperty(this, 'cast', {
            value: cast ? cast : x => x,
            enumerable: false,
            writable: false
        });
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