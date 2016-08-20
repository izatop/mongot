import {SchemaMetadata} from "../document";
import {Collection} from "../collection";

const StoreCollection: WeakMap<typeof Collection, {name: string; construct?: typeof SchemaMetadata; options?: Object}> = new WeakMap();
const StoreType: WeakMap<typeof SchemaMetadata, Map<string | symbol, {type?: any; proto?: any; required?: boolean}>> = new WeakMap();
const StoreHooks: WeakMap<typeof SchemaMetadata, Array<string>> = new WeakMap();

export class MetadataStore {
    private constructor() {}
    
    static setCollectionMetadata(target: typeof Collection, name: string, construct?: typeof SchemaMetadata, options?: Object) {
        StoreCollection.set(target, {name, construct, options});
    }
    
    static getCollectionMetadata(target: typeof Collection) {
        return StoreCollection.get(target);
    }
    
    static setSchemaPropertyMetadata(target: typeof SchemaMetadata, property: string | symbol, metadata: {[key: string]: any}) {
        if (false === StoreType.has(target)) {
            StoreType.set(target, new Map());
        }
        
        if (false === StoreType.get(target).has(property)) {
            StoreType.get(target).set(property, {});
        }
    
        Object.assign(StoreType.get(target).get(property), metadata);
    }
    
    static getSchemaMetadata(target: typeof SchemaMetadata): Map<string | symbol, {type?: any; proto?: any; required?: boolean}> {
        return StoreType.get(target);
    }
    
    static getSchemaPropertyMetadata(target: typeof SchemaMetadata, property: string | symbol): {type?: any; proto?: any; required?: boolean} {
        return StoreType.get(target).get(property) as {type?: any; proto?: any; required?: boolean};
    }
    
    static setSchemaHookMetadata(target: typeof SchemaMetadata, method: string) {
        StoreHooks.set(target, (StoreHooks.get(target) || []).concat([method]));
    }
    
    static getSchemaHookMetadata(target: typeof SchemaMetadata) {
        return StoreHooks.get(target);
    }
}
