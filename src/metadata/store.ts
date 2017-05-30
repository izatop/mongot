import {SchemaMetadata} from "../document";
import {Collection} from "../collection";

const StoreCollection: WeakMap<typeof Collection, {name: string; construct?: typeof SchemaMetadata; options?: Object}> = new WeakMap();
const StoreCollectionIndexes: WeakMap<typeof Collection, {indexOrSpec: string | {[key: string]: 1 | -1}, options?: Object}[]> = new WeakMap();
const StoreType: WeakMap<typeof SchemaMetadata, Map<string | symbol, {type?: any; proto?: any; required?: boolean}>> = new WeakMap();
const StoreHooks: WeakMap<typeof SchemaMetadata, Map<string, string[]>> = new WeakMap();

export class MetadataStore {
    private constructor() {}

    static setCollectionMetadata(target: typeof Collection, name: string, construct?: typeof SchemaMetadata, options?: Object) {
        StoreCollection.set(target, {name, construct, options});
    }

    static setCollectionIndexMetadata(target: typeof Collection, indexOrSpec: string | {[key: string]: 1 | -1}, options?: Object) {
        StoreCollectionIndexes.set(target, [
            ...(StoreCollectionIndexes.get(target) || []),
            {
                indexOrSpec,
                options
            }
        ]);
    }

    static getCollectionIndexMetadata(target: typeof Collection) {
        return StoreCollectionIndexes.get(target);
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
        const maps = [];
        const proto: any = Object.getPrototypeOf(target);

        if (proto && proto !== target && StoreType.has(proto)) {
            maps.push(...this.getSchemaMetadata(proto));
        }

        if (StoreType.has(target)) {
            maps.push(...StoreType.get(target));
        }

        return new Map<string | symbol, {type?: any; proto?: any; required?: boolean}>(maps);
    }

    static getSchemaPropertyMetadata(target: typeof SchemaMetadata, property: string | symbol): {type?: any; proto?: any; required?: boolean} {
        return StoreType.get(target).get(property) as {type?: any; proto?: any; required?: boolean};
    }

    static setSchemaHookMetadata(target: typeof SchemaMetadata, hook: string, property?: string) {
        if (false === StoreHooks.has(target)) {
            StoreHooks.set(target, new Map<string, string[]>());
        }

        if (false === StoreHooks.get(target).has(hook)) {
            StoreHooks.get(target).set(hook, []);
        }

        StoreHooks.get(target).get(hook).push(property || hook);
    }

    static getSchemaHookMetadata(target: typeof SchemaMetadata) {
        return StoreHooks.get(target);
    }
}
