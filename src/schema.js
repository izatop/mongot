"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./reflect");
const assert_1 = require("assert");
const store_1 = require("./metadata/store");
const document_1 = require("./document");
const collection_1 = require("./collection");
exports.collection = (...args) => {
    assert_1.ok(args.length > 0 && args.length < 4, 'Mapper @collection has invalid number of arguments: ' + args.length);
    assert_1.ok(typeof args[0] === 'function' || typeof args[0] === 'string', 'Mapper @collection has invalid type of first argument');
    if (typeof args[0] === 'function') {
        const constructor = args.shift();
        store_1.MetadataStore.setCollectionMetadata(constructor, name);
    }
    else {
        const name = args.shift();
        const construct = args.shift();
        const options = args.shift() || {};
        return (target) => {
            store_1.MetadataStore.setCollectionMetadata(target, name, construct, options);
        };
    }
};
exports.index = (indexOrSpec, options) => {
    return (target) => {
        store_1.MetadataStore.setCollectionIndexMetadata(target, indexOrSpec, options);
    };
};
exports.indexes = (...specs) => {
    return (target) => {
        specs.forEach(spec => store_1.MetadataStore.setCollectionIndexMetadata(target, spec[0], spec[1] || {}));
    };
};
exports.document = (target) => {
    return new Proxy(target, {
        construct: (target, args) => {
            return target.factory(args[0]);
        }
    });
};
exports.fragment = exports.document;
function checkProto(type, proto, target, propertyKey) {
    if (Array.isPrototypeOf(type)) {
        assert_1.ok(proto !== type, `Schema ${target.constructor.name} should have a proto for an array of ${propertyKey} property`);
    }
}
exports.prop = (...args) => {
    if (args.length > 1) {
        const [target, propertyKey] = args;
        let type = Reflect.getMetadata('design:type', target, propertyKey), proto = type;
        if (typeof type === "function" && document_1.SchemaFragment.isPrototypeOf(type)) {
            type = document_1.SchemaFragment;
        }
        checkProto(type, proto, target, propertyKey);
        store_1.MetadataStore.setSchemaPropertyMetadata(target.constructor, propertyKey, { type, proto });
    }
    else {
        return (target, propertyKey) => {
            const type = Reflect.getMetadata('design:type', target, propertyKey) || args.shift();
            const proto = args.shift() || type;
            checkProto(type, proto, target, propertyKey);
            store_1.MetadataStore.setSchemaPropertyMetadata(target.constructor, propertyKey, { type, proto });
        };
    }
};
exports.required = (target, propertyKey) => {
    store_1.MetadataStore.setSchemaPropertyMetadata(target.constructor, propertyKey, { required: true });
};
exports.req = (target, propertyKey) => {
    exports.required(target, propertyKey);
};
exports.preq = (...args) => {
    if (args.length > 1) {
        const [target, propertyKey] = args;
        exports.required(target, propertyKey);
        exports.prop(target, propertyKey);
    }
    else {
        return (target, propertyKey) => {
            exports.required(target, propertyKey);
            exports.prop(args.shift())(target, propertyKey);
        };
    }
};
exports.hook = (...args) => {
    if (typeof args[0] === 'string') {
        return (target, propertyKey) => {
            store_1.MetadataStore.setSchemaHookMetadata(target.constructor, args[0], propertyKey);
        };
    }
    const [target, propertyKey] = args;
    store_1.MetadataStore.setSchemaHookMetadata(target.constructor, propertyKey);
};
exports.auto = (fn) => {
    return (target, propertyKey) => {
        const property = `$_generated_auto_before_insert_${propertyKey}$`;
        target[property] = function (collection) {
            return __awaiter(this, void 0, void 0, function* () {
                this[propertyKey] = yield fn(collection);
            });
        };
        store_1.MetadataStore.setSchemaHookMetadata(target.constructor, collection_1.Events.beforeInsert, property);
    };
};
//# sourceMappingURL=schema.js.map