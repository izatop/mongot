import "./reflect";
import * as MongoDb from 'mongodb';
import { SchemaDocument } from "./document";
import { Collection } from "./collection";
export interface CollectionDecorator {
    (target: typeof Collection): void;
    (name: string, schema: typeof SchemaDocument, options?: MongoDb.CollectionCreateOptions | MongoDb.CollectionOptions): (constructor: typeof Collection) => void;
}
export interface IndexDecorator {
    (indexOrSpec: string | {
        [key: string]: 1 | -1;
    }, options?: MongoDb.IndexOptions): (constructor: typeof Collection) => void;
}
export declare const collection: CollectionDecorator;
export declare const index: IndexDecorator;
export declare const indexes: (...specs: ([string | {
    [key: string]: 1 | -1;
}, MongoDb.IndexOptions] | [string | {
    [key: string]: 1 | -1;
}])[]) => (target: typeof Collection) => void;
export interface PropDecorator {
    (target: any, propertyKey: string | symbol): void;
    <T>(type: T): PropertyDecorator;
}
export declare const prop: PropDecorator;
export declare const required: PropertyDecorator;
export declare const req: PropertyDecorator;
export interface PropRequiredDecorator {
    <T>(type: T): PropertyDecorator;
    (target: any, propertyKey: string | symbol): void;
}
export declare const preq: PropRequiredDecorator;
export declare const hook: (target: any, propertyKey: string) => void;