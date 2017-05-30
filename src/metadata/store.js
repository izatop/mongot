"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StoreCollection = new WeakMap();
const StoreCollectionIndexes = new WeakMap();
const StoreType = new WeakMap();
const StoreHooks = new WeakMap();
class MetadataStore {
    constructor() { }
    static setCollectionMetadata(target, name, construct, options) {
        StoreCollection.set(target, { name, construct, options });
    }
    static setCollectionIndexMetadata(target, indexOrSpec, options) {
        StoreCollectionIndexes.set(target, [
            ...(StoreCollectionIndexes.get(target) || []),
            {
                indexOrSpec,
                options
            }
        ]);
    }
    static getCollectionIndexMetadata(target) {
        return StoreCollectionIndexes.get(target);
    }
    static getCollectionMetadata(target) {
        return StoreCollection.get(target);
    }
    static setSchemaPropertyMetadata(target, property, metadata) {
        if (false === StoreType.has(target)) {
            StoreType.set(target, new Map());
        }
        if (false === StoreType.get(target).has(property)) {
            StoreType.get(target).set(property, {});
        }
        Object.assign(StoreType.get(target).get(property), metadata);
    }
    static getSchemaMetadata(target) {
        const maps = [];
        const proto = Object.getPrototypeOf(target);
        if (proto && proto !== target && StoreType.has(proto)) {
            maps.push(...this.getSchemaMetadata(proto));
        }
        if (StoreType.has(target)) {
            maps.push(...StoreType.get(target));
        }
        return new Map(maps);
    }
    static getSchemaPropertyMetadata(target, property) {
        return StoreType.get(target).get(property);
    }
    static setSchemaHookMetadata(target, hook, property) {
        if (false === StoreHooks.has(target)) {
            StoreHooks.set(target, new Map());
        }
        if (false === StoreHooks.get(target).has(hook)) {
            StoreHooks.get(target).set(hook, []);
        }
        StoreHooks.get(target).get(hook).push(property || hook);
    }
    static getSchemaHookMetadata(target) {
        return StoreHooks.get(target);
    }
}
exports.MetadataStore = MetadataStore;
//# sourceMappingURL=store.js.map