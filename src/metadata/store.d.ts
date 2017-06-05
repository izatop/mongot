import { SchemaMetadata } from "../document";
import { Collection } from "../collection";
import { indexSpecType } from "../schema";
export declare class MetadataStore {
    private constructor();
    static setCollectionMetadata(target: typeof Collection, name: string, construct?: typeof SchemaMetadata, options?: Object): void;
    static setCollectionIndexMetadata(target: typeof Collection, indexOrSpec: indexSpecType, options?: Object): void;
    static getCollectionIndexMetadata(target: typeof Collection): {
        indexOrSpec: indexSpecType;
        options?: Object;
    }[];
    static getCollectionMetadata(target: typeof Collection): {
        name: string;
        construct?: typeof SchemaMetadata;
        options?: Object;
    };
    static setSchemaPropertyMetadata(target: typeof SchemaMetadata, property: string | symbol, metadata: {
        [key: string]: any;
    }): void;
    static getSchemaMetadata(target: typeof SchemaMetadata): Map<string | symbol, {
        type?: any;
        proto?: any;
        required?: boolean;
    }>;
    static getSchemaPropertyMetadata(target: typeof SchemaMetadata, property: string | symbol): {
        type?: any;
        proto?: any;
        required?: boolean;
    };
    static setSchemaHookMetadata(target: typeof SchemaMetadata, hook: string, property?: string): void;
    static getSchemaHookMetadata(target: typeof SchemaMetadata): Map<string, string[]>;
    static setSchemaVirtualMetadata(target: typeof SchemaMetadata, virtual: string | symbol): void;
    static getSchemaVirtualMetadata(target: typeof SchemaMetadata): (string | symbol)[];
}
