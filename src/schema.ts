import "./reflect";
import {ok} from "assert";
import * as MongoDb from 'mongodb';
import {MetadataStore} from './metadata/store';
import {SchemaDocument, SchemaMetadata, SchemaFragment} from "./document";
import {Collection} from "./collection";

export interface CollectionDecorator {
    (target: typeof Collection): void;
    (
        name: string,
        schema: typeof SchemaDocument,
        options?: MongoDb.CollectionCreateOptions | MongoDb.CollectionOptions
    ): (constructor: typeof Collection) => void;
}

export interface IndexDecorator {
    (
        indexOrSpec: string | {[key: string]: 1 | -1},
        options?: MongoDb.IndexOptions
    ): (constructor: typeof Collection) => void;
}

export const collection: CollectionDecorator = (...args: any[]) => {
    ok(args.length > 0 && args.length < 4, 'Mapper @collection has invalid number of arguments: ' + args.length);
    ok(typeof args[0] === 'function' || typeof args[0] === 'string', 'Mapper @collection has invalid type of first argument');
    
    if (typeof args[0] === 'function') {
        const constructor: typeof Collection = args.shift();
        MetadataStore.setCollectionMetadata(constructor, name);
    } else {
        const name = args.shift();
        const construct: typeof SchemaDocument = args.shift();
        const options: Object = args.shift() || {};
        
        return (target: typeof Collection): void => {
            MetadataStore.setCollectionMetadata(target, name, construct, options);
        }
    }
};

export const index: IndexDecorator = (indexOrSpec: string | {[key: string]: 1 | -1}, options?: MongoDb.IndexOptions) => {
    return (target: typeof Collection): void => {
        MetadataStore.setCollectionIndexMetadata(target, indexOrSpec, options);
    }
};

export const indexes = (...specs: Array<[string | {[key: string]: 1 | -1}, MongoDb.IndexOptions] | [string | {[key: string]: 1 | -1}]>) => {
    return (target: typeof Collection): void => {
        specs.forEach(spec => MetadataStore.setCollectionIndexMetadata(target, spec[0], spec[1] || {}));
    }
};

export interface PropDecorator {
    (target: any, propertyKey: string | symbol): void;
    <T>(type: T): PropertyDecorator;
}

function checkProto(type: any, proto: any, target: any, propertyKey: any) {
    if (Array.isPrototypeOf(type)) {
        ok(
            proto !== type,
            `Schema ${target.constructor.name} should have a proto for an array of ${propertyKey} property`
        );
    }
}

export const prop:PropDecorator = (...args: any[]) => {
    if (args.length > 1) {
        const [target, propertyKey] = args;
        let type: any = Reflect.getMetadata('design:type', target, propertyKey),
            proto = type;
        
        if (typeof type === "function" && SchemaFragment.isPrototypeOf(type)) {
            type = SchemaFragment;
        }
    
        checkProto(type, proto, target, propertyKey);
        
        MetadataStore.setSchemaPropertyMetadata(
            target.constructor,
            propertyKey,
            {type, proto}
        );
    } else {
        return (target: any, propertyKey: string | symbol): void => {
            const type = Reflect.getMetadata('design:type', target, propertyKey) || args.shift();
            const proto = args.shift() || type;
            
            checkProto(type, proto, target, propertyKey);
            
            MetadataStore.setSchemaPropertyMetadata(
                target.constructor,
                propertyKey,
                {type, proto}
            );
        }
    }
};

export const required: PropertyDecorator = (target: any, propertyKey: string | symbol) => {
    MetadataStore.setSchemaPropertyMetadata(target.constructor, propertyKey, {required: true});
};

export const req: PropertyDecorator = (target: any, propertyKey: string | symbol) => {
    required(target, propertyKey);
};

export interface PropRequiredDecorator {
    <T>(type: T): PropertyDecorator;
    (target: any, propertyKey: string | symbol): void;
}

export const preq:PropRequiredDecorator = (...args: any[]) => {
    if (args.length > 1) {
        const [target, propertyKey] = args;
        required(target, propertyKey);
        prop(target, propertyKey);
    } else {
        return (target: any, propertyKey: string | symbol) => {
            required(target, propertyKey);
            prop(args.shift())(target, propertyKey);
        }
    }
};

export const hook = (target: any, propertyKey: string) => {
    MetadataStore.setSchemaHookMetadata(target.constructor, propertyKey);
};
