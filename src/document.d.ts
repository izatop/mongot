import { SchemaMutate } from './metadata/mutation';
import { Collection } from "./collection";
import { ObjectID } from "./schema";
export declare const PRIMARY_KEY_NAME = "_id";
export declare class TypeCast {
    static cast(type: any, value: any, proto?: any): any;
    static toPlainValue(value: any): any;
    static extract(value: any): any;
    static castToArray(type: typeof SchemaArray, proto: any, value: any): SchemaArray<any>;
    static castToFragmentArray(type: typeof SchemaArray, proto: any, value: any): SchemaArray<any>;
    static castToFragment(proto: typeof SchemaFragment, value: Object): SchemaFragment;
    static castToBoolean(value: any): boolean;
    static castToDate(value: any): Date;
    static castToString(value: any): string;
    static castToNumber(value: any): number;
}
export declare class SchemaMetadata extends SchemaMutate {
    readonly _id?: ObjectID;
    constructor(document?: Object);
    protected __mutate(document?: Object): this;
    protected getMetadata(): Map<string | symbol, {
        type?: any;
        proto?: any;
        required?: boolean;
    }>;
    protected getDefinedHooks(): Map<string, string[]>;
    toObject(): any;
    toJSON(): any;
    extract(): any;
    static factory<T extends SchemaMetadata>(document?: Object): T;
}
export declare abstract class SchemaDocument extends SchemaMetadata {
    readonly _id: ObjectID;
    call(hook: string, collection: Collection<this>): Promise<any[]>;
}
export declare class SchemaFragment extends SchemaMetadata {
    readonly _id?: ObjectID;
}
export declare class PartialDocumentFragment extends SchemaMetadata {
    protected __mutate(document: Object): this;
    protected getMetadata(): Map<any, any>;
}
export declare class SchemaArray<T> extends Array<T> {
    protected readonly cast: (value: any) => T;
    constructor(values?: T[], cast?: (value: any) => T);
    toArray(): Array<T>;
    toJSON(): T[];
    push(...items: Object[]): number;
    unshift(...items: Object[]): number;
    pull(value: T): void;
}
export declare class SchemaFragmentArray<T extends SchemaFragment> extends SchemaArray<T> {
    search(id: ObjectID | string | number): T;
}
