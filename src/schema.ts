import "./reflect";
import {ok} from "assert";
import * as MongoDb from 'mongodb';
import {MetadataStore} from './metadata/store';
import {SchemaFragment} from "./document";
import {Collection, Events} from "./collection";
import {SchemaMetadata} from "./document";

export interface CollectionDecorator {
    (
        name: string,
        schema: typeof SchemaMetadata,
        options?: MongoDb.CollectionCreateOptions | MongoDb.CollectionOptions
    ): (constructor: any) => void;
}

export type indexSpecType = string | {[key: string]: 1 | -1 | 'text' | 'hashed' | '2dsphere'};

export interface IndexDecorator {
    (
        indexOrSpec: indexSpecType,
        options?: MongoDb.IndexOptions
    ): (constructor: any) => void;
}

export const collection: CollectionDecorator = (name: string, construct: typeof SchemaMetadata, options: Object = {}) => {
    ok(typeof name === 'string' && name.length, 'A @collection mapper should get a valid name');
    ok(typeof construct === 'function', 'A @collection mapper should get a valid a document schema');

    return (target: typeof Collection): void => {
        MetadataStore.setCollectionMetadata(target, name, construct, options);
    }
};

export const index: IndexDecorator = (indexOrSpec: indexSpecType, options?: MongoDb.IndexOptions) => {
    return (target: typeof Collection): void => {
        MetadataStore.setCollectionIndexMetadata(target, indexOrSpec, options);
    }
};

export const indexes = (...specs: Array<[indexSpecType, MongoDb.IndexOptions] | [indexSpecType]>) => {
    return (target: any): void => {
        specs.forEach(spec => MetadataStore.setCollectionIndexMetadata(target, spec[0], spec[1] || {}));
    }
};

export const document = (target: any) => {
    return new Proxy(target, {
        construct: (target: typeof SchemaMetadata, args) => {
            return target.factory(args[0]);
        }
    })
};

export const fragment = document;

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

export const hook = (...args: any[]) => {
    if (typeof args[0] === 'string') {
        return (target: any, propertyKey: string) => {
            MetadataStore.setSchemaHookMetadata(target.constructor, args[0], propertyKey);
        }
    }

    const [target, propertyKey] = args;
    MetadataStore.setSchemaHookMetadata(target.constructor, propertyKey);
};

export const auto = (fn: Function) => {
    return (target: any, propertyKey: string) => {
        const property = `$_generated_auto_before_insert_${propertyKey}$`;
        target[property] = async function (collection) {
            this[propertyKey] = await fn(collection);
            return true;
        };

        MetadataStore.setSchemaHookMetadata(target.constructor, Events.beforeInsert, property);
    }
};

export const virtual = (target: any, propertyKey: string | symbol) => {
    MetadataStore.setSchemaVirtualMetadata(target.constructor, propertyKey);
};

export {ObjectID, Long} from 'mongodb';
