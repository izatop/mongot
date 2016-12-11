/// <reference types="node" />
import { ObjectID } from "mongodb";
import { EventEmitter } from "events";
export declare class TypeCast {
    static cast(type: any, value: any, proto?: any): any;
    static toPlainValue(value: any): any;
    static castToArray(type: typeof SchemaArray, proto: any, value: any): SchemaArray<any>;
    static castToFragmentArray(type: typeof SchemaArray, proto: any, value: any): SchemaArray<any>;
    static castToFragment(proto: typeof SchemaFragment, value: Object): SchemaFragment;
    static castToBoolean(value: any): boolean;
    static castToDate(value: any): Date;
    static castToString(value: any): string;
    static castToNumber(value: any): number;
}
export declare class SchemaMetadata {
    readonly _id?: ObjectID;
    constructor(document?: Object);
    toObject(): any;
    toJSON(): any;
    protected upgrade(document?: Object): void;
    static factory<T extends SchemaMetadata>(document?: Object): T;
    protected getMetadata(): any;
    protected getPropertyMetadata(property: any): {
        type?: any;
        proto?: any;
        required?: boolean;
    };
    protected getDefinedHooks(): string[];
}
export declare class SchemaDocument extends SchemaMetadata {
    readonly _id: ObjectID;
    getEventListener(): EventEmitter;
    protected beforeInsert(): void;
    protected beforeUpdate(): void;
    protected beforeDelete(): void;
    protected afterInsert(): void;
    protected afterUpdate(): void;
    protected afterDelete(): void;
}
export declare class SchemaFragment extends SchemaMetadata {
    readonly _id?: ObjectID;
}
export declare class PartialDocument extends SchemaDocument {
}
export declare class SchemaArray<T> extends Array<T> {
    protected readonly cast: (value: any) => T;
    constructor(values?: T[], cast?: (value: any) => T);
    toArray(): Array<T>;
    push(...items: Object[]): number;
    unshift(...items: Object[]): number;
    pull(value: T): void;
}
export declare class SchemaFragmentArray<T extends SchemaFragment> extends SchemaArray<T> {
    search(id: ObjectID | string | number): T;
}
