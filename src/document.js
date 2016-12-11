"use strict";
const mongodb_1 = require("mongodb");
const assert_1 = require("assert");
const store_1 = require("./metadata/store");
const events_1 = require("events");
class TypeCast {
    static cast(type, value, proto) {
        if (typeof value === "undefined" || value === null) {
            return value;
        }
        switch (type) {
            case mongodb_1.ObjectID:
                return new mongodb_1.ObjectID(value);
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
                if (value instanceof mongodb_1.ObjectID) {
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
class SchemaMetadata {
    constructor(document) {
        Object.defineProperty(this, Symbol.for('id'), { value: undefined, configurable: false, writable: true });
        Object.defineProperty(this, '_id', {
            get() {
                return this[Symbol.for('id')];
            },
            set(value) {
                this[Symbol.for('id')] = value;
            },
            enumerable: true,
            configurable: false
        });
        Object.assign(this, document);
    }
    toObject() {
        const properties = [];
        Object.keys(this)
            .forEach(key => {
            // Allow assigned values only
            if (typeof this[key] !== 'undefined') {
                properties.push({ [key]: TypeCast.toPlainValue(this[key]) });
            }
        });
        return Object.assign({}, ...properties);
    }
    toJSON() {
        return this.toObject();
    }
    upgrade(document) {
        const merge = Object.assign({}, this, document);
        const metadata = this.getMetadata();
        assert_1.ok(!!metadata, `Metadata does not defined for ${this.constructor.name}`);
        metadata.forEach(({ type, proto }, key) => {
            const storageKey = Symbol(key);
            Object.defineProperty(this, storageKey, { value: undefined, writable: true, configurable: false });
            Object.defineProperty(this, key, {
                get: () => this[storageKey],
                set: (newValue) => {
                    this[storageKey] = TypeCast.cast(type, newValue, proto);
                },
                enumerable: true,
                configurable: false
            });
        });
        Object.keys(merge).forEach(key => {
            if (!Object.getOwnPropertyDescriptor(this, key)) {
                throw new Error(`Unknown ${this.constructor.name} property: ${key}`);
            }
            this[key] = merge[key];
        });
    }
    static factory(document) {
        const instance = new this(document);
        instance.upgrade(document);
        return instance;
    }
    getMetadata() {
        if (this instanceof PartialDocument) {
            const obj = Object.keys(this).filter(x => x !== '_id').map(x => ([x, { type: Object, proto: Object }]));
            return new Map([...obj]);
        }
        return store_1.MetadataStore.getSchemaMetadata((this.constructor));
    }
    getPropertyMetadata(property) {
        return store_1.MetadataStore.getSchemaPropertyMetadata((this.constructor), property);
    }
    getDefinedHooks() {
        return store_1.MetadataStore.getSchemaHookMetadata((this.constructor));
    }
}
exports.SchemaMetadata = SchemaMetadata;
class SchemaDocument extends SchemaMetadata {
    getEventListener() {
        const emitter = new events_1.EventEmitter();
        this.getDefinedHooks().forEach(hook => {
            if (typeof this[hook] === 'function') {
                emitter.on(hook, () => this[hook]());
            }
        });
        return emitter;
    }
    beforeInsert() { }
    beforeUpdate() { }
    beforeDelete() { }
    afterInsert() { }
    afterUpdate() { }
    afterDelete() { }
}
exports.SchemaDocument = SchemaDocument;
class SchemaFragment extends SchemaMetadata {
}
exports.SchemaFragment = SchemaFragment;
class PartialDocument extends SchemaDocument {
}
exports.PartialDocument = PartialDocument;
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
        let _id = TypeCast.cast(mongodb_1.ObjectID, id);
        return this.filter(x => x._id.equals(_id))
            .shift();
    }
}
exports.SchemaFragmentArray = SchemaFragmentArray;
//# sourceMappingURL=document.js.map