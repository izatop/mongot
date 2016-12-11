"use strict";
require("./reflect");
const assert_1 = require("assert");
const store_1 = require("./metadata/store");
const document_1 = require("./document");
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
exports.hook = (target, propertyKey) => {
    store_1.MetadataStore.setSchemaHookMetadata(target.constructor, propertyKey);
};
//# sourceMappingURL=schema.js.map