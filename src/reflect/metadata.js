"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./reflect");
if (!Reflect.metadata) {
    const storage = new WeakMap();
    class Metadata {
        static get(target, property) {
            if (false === storage.has(target)) {
                storage.set(target, new Map());
            }
            if (false === storage.get(target).has(property || 'constructor')) {
                storage.get(target).set(property || 'constructor', new Map());
            }
            return storage.get(target).get(property || 'constructor');
        }
    }
    Reflect.metadata = function (metadataKey, metadataValue) {
        return (target, propertyKey) => {
            Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
        };
    };
    Reflect.defineMetadata = function (metadataKey, metadataValue, target, propertyKey) {
        Metadata.get(target, propertyKey).set(metadataKey, metadataValue);
    };
    Reflect.hasMetadata = function (metadataKey, target, propertyKey) {
        return Metadata.get(target, propertyKey).has(metadataKey);
    };
    Reflect.hasOwnMetadata = function (metadataKey, target, propertyKey) {
        return Metadata.get(target, propertyKey).has(metadataKey);
    };
    Reflect.getMetadata = function (metadataKey, target, propertyKey) {
        return Metadata.get(target, propertyKey).get(metadataKey);
    };
    Reflect.getOwnMetadata = function (metadataKey, target, propertyKey) {
        return Metadata.get(target, propertyKey).get(metadataKey);
    };
    Reflect.getMetadataKeys = function (target, propertyKey) {
        return [...Metadata.get(target, propertyKey).keys()];
    };
    Reflect.getOwnMetadataKeys = function (target, propertyKey) {
        return [...Metadata.get(target, propertyKey).keys()];
    };
    Reflect.deleteMetadata = function (metadataKey, target, propertyKey) {
        Metadata.get(target, propertyKey).delete(metadataKey);
    };
}
//# sourceMappingURL=metadata.js.map