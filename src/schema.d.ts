import "./reflect";
import * as MongoDb from 'mongodb';
import { Collection } from "./collection";
import { SchemaMetadata } from "./document";
export interface CollectionDecorator {
    (name: string, schema: typeof SchemaMetadata, options?: MongoDb.CollectionCreateOptions | MongoDb.CollectionOptions): (constructor: typeof Collection) => void;
}
export declare type indexSpecType = string | {
    [key: string]: 1 | -1 | 'text' | 'hashed' | '2dsphere';
};
export interface IndexDecorator {
    (indexOrSpec: indexSpecType, options?: MongoDb.IndexOptions): (constructor: typeof Collection) => void;
}
export declare const collection: CollectionDecorator;
export declare const index: IndexDecorator;
export declare const indexes: (...specs: ([indexSpecType, MongoDb.IndexOptions] | [indexSpecType])[]) => (target: typeof Collection) => void;
export declare const document: (target: any) => any;
export declare const fragment: (target: any) => any;
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
export declare const hook: (...args: any[]) => (target: any, propertyKey: string) => void;
export declare const auto: (fn: Function) => (target: any, propertyKey: string) => void;
export declare const virtual: (target: any, propertyKey: string | symbol) => void;
export { ObjectID } from 'mongodb';
