import {ok} from 'assert';
import {MetadataStore} from "./metadata/store";
import {SchemaMutate} from './metadata/mutation';
import {Collection} from "./collection";
import {ObjectID} from "./schema";

const identifiers = new WeakMap<SchemaMetadata, ObjectID>();
const values = new WeakMap<SchemaMetadata, Object>();

export const PRIMARY_KEY_NAME = '_id';

export class TypeCast {
    static cast(type: any, value: any, proto?: any): any {
        if (typeof value === "undefined" || value === null) {
            return value;
        }
        
        switch (type) {
            case ObjectID:
                return new ObjectID(value);
        
            case String:
                return TypeCast.castToString(value);
        
            case Number:
                return TypeCast.castToNumber(value);
        
            case Date:
                return TypeCast.castToDate(value);
        
            case Boolean:
                return TypeCast.castToBoolean(value);
        
            case SchemaArray:
                return TypeCast.castToArray(type, proto, value);
            
            case SchemaFragmentArray:
                return TypeCast.castToFragmentArray(type, proto, value);
        
            case SchemaFragment:
                return TypeCast.castToFragment(proto, value);
        
            case Buffer:
                return value;
        
            case Object:
                return value;
        }
    }
    
    static toPlainValue(value: any) {
        switch (typeof value) {
            case 'object': {
                if (value === null) {
                    return value;
                }
                
                if (value instanceof ObjectID) {
                    return value.toString();
                }

                if (value instanceof SchemaMetadata) {
                    return value.toObject();
                }
                
                if (value instanceof SchemaArray) {
                    return value.toArray();
                }
    
                if (Array.isArray(value)) {
                    return value.map(x => TypeCast.toPlainValue(x));
                }
                
                if (Object.prototype.toString.call(value) === '[object Object]') {
                    return Object.assign(
                        {},
                        ...Object.keys(value)
                            .map(key => ({[key]: TypeCast.toPlainValue(value[key])}))
                    );
                } else {
                    return value;
                }
            }
            
            default:
                return value;
        }
    }
    
    static castToArray(type: typeof SchemaArray, proto: any, value: any): SchemaArray<any> {
        ok(true === Array.isArray(value), `${type.name} need an array value for constructor given ${value.toString()}.`);
        return new type(value, x => TypeCast.cast(proto, x));
    }
    
    static castToFragmentArray(type: typeof SchemaArray, proto: any, value: any): SchemaArray<any> {
        ok(true === Array.isArray(value), `${type.name} need an array value for constructor given ${value.toString()}.`);
        return new type(value, x => TypeCast.cast(SchemaFragment, x, proto));
    }
    
    static castToFragment(proto: typeof SchemaFragment, value: Object): SchemaFragment {
        return proto.factory<SchemaFragment>(value);
    }
    
    static castToBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        }
        
        switch (value) {
            case '':
            case '0':
            case 'false':
            case null:
            case false:
                return false;
        
            case '1':
            case 'true':
            case true:
                return true;
        }
    
        return !!value;
    }
    
    static castToDate(value: any): Date {
        if (value instanceof Date) {
            return value;
        }
        
        return new Date(value);
    }
    
    static castToString(value: any): string {
        if (typeof value === 'string') {
            return value;
        }
        
        return String(value);
    }
    
    static castToNumber(value: any): number {
        if (typeof value === 'number') {
            return value;
        }
        
        const normalized = Number(value);
        return false === isNaN(normalized) ? normalized : 0;
    }
}

export class SchemaMetadata extends SchemaMutate {
    readonly _id?: ObjectID;

    constructor(document?: Object) {
        super(document);

        const metadata = this.getMetadata();
        ok(!!metadata, `Metadata doesn't exists for ${this.constructor.name}`);

        let _id = undefined;
        if (typeof document === 'object' && document !== null) {
            _id = document[PRIMARY_KEY_NAME];
        }

        values.set(this, {});
        identifiers.set(this, _id);

        // Shadow setter for _id
        Object.defineProperty(this, Symbol.for(PRIMARY_KEY_NAME), {
            value: (_id) => identifiers.set(this, _id),
            writable: false,
            enumerable: false,
            configurable: false
        });

        Object.defineProperty(this, PRIMARY_KEY_NAME, {
            get() {
                return identifiers.get(this);
            },
            enumerable: true,
            configurable: false
        });

        metadata.forEach(({type, proto}, key: string) => {
            Object.defineProperty(this, key, {
                get: (): any => values.get(this)[key],
                set: (newValue): void => {
                    values.get(this)[key] = TypeCast.cast(type, newValue, proto);
                },
                enumerable: true,
                configurable: false
            });
        });
    }
    
    protected __mutate(document?: Object) {
        ok(typeof document && document !== null, `${this.constructor.name} an unexpected document type ${typeof document}`);
        const properties = Object.assign({}, this.toObject(), document);
        if (properties._id) {
            let {_id} = properties;
            if (typeof _id === 'string') {
                _id = ObjectID.createFromHexString(_id);
            } else if (false === _id instanceof ObjectID) {
                throw new Error(`Cannot convert "${_id}" to ObjectID`);
            }

            identifiers.set(this, _id);
        }

        Object.keys(properties)
            .filter(field => field !== PRIMARY_KEY_NAME)
            .forEach(key => {
                if (!Object.getOwnPropertyDescriptor(this, key)) {
                    // @TODO Add strict checking for skipped properties
                    // throw new Error(`Schema ${this.constructor.name} unknown property: ${key}`);
                    return ;
                }

                this[key] = properties[key];
            });

        return this;
    }

    protected getMetadata() {
        return MetadataStore.getSchemaMetadata(<typeof SchemaMetadata> (this['constructor']));
    }

    protected getDefinedHooks() {
        return MetadataStore.getSchemaHookMetadata(<typeof SchemaMetadata> (this['constructor']));
    }

    toObject() {
        const properties = [];
        Object.keys(this)
            .forEach(key => {
                if (typeof this[key] !== 'undefined') {
                    properties.push({[key]: TypeCast.toPlainValue(this[key])});
                }
            });

        return Object.assign({}, ...properties);
    }

    toJSON() {
        return this.toObject();
    }

    static factory<T extends SchemaMetadata>(document?: Object): T {
        return new this().__mutate(document) as T;
    }
}

export abstract class SchemaDocument extends SchemaMetadata {
    readonly _id: ObjectID;

    call(hook: string, collection: Collection<this>): Promise<any[]> {
        const definedHooks = this.getDefinedHooks();
        if (definedHooks && definedHooks.has(hook)) {
            return Promise.all(definedHooks.get(hook).map(property => this[property](collection)));
        }

        return Promise.resolve([]);
    }
}

export class SchemaFragment extends SchemaMetadata {
    readonly _id?: ObjectID;
}

export class PartialDocumentFragment extends SchemaMetadata {
    protected __mutate(document: Object) {
        ok(typeof document && document !== null, `${this.constructor.name} an unexpected document type ${typeof document}`);
        let {_id, ...properties} = Object.assign({}, this.toObject(), document);

        if (typeof _id === 'string') {
            _id = ObjectID.createFromHexString(_id);
        } else if (false === _id instanceof ObjectID) {
            throw new Error(`Cannot convert "${_id}" to ObjectID`);
        }

        identifiers.set(this, _id);
        Object.assign(this, properties);
        return this;
    }

    protected getMetadata() {
        return new Map();
    }
}

export class SchemaArray<T> extends Array<T> {
    protected readonly cast: (value: any) => T;
    
    constructor(values?: T[], cast?: (value: any) => T) {
        super();
        this.cast = cast ? cast : x => x as T;
        if (values && typeof values === 'object') {
            [...values].forEach(value => this.push(value));
        }
    }
    
    toArray(): Array<T> {
        return [...this].map(value => TypeCast.toPlainValue(value));
    }

    toJSON() {
        return this.toArray();
    }
    
    push(...items: Object[]): number {
        return super.push(...items.map(this.cast));
    }
    
    unshift(...items: Object[]): number {
        return super.unshift(...items.map(this.cast));
    }
    
    pull(value: T) {
        let index = this.indexOf(value);
        if (index !== -1) {
            this.splice(index, 1);
        }
    }
}

export class SchemaFragmentArray<T extends SchemaFragment> extends SchemaArray<T> {
    search(id: ObjectID | string | number): T {
        let _id: ObjectID = TypeCast.cast(ObjectID, id);
        
        return this.filter(x => x._id.equals(_id))
            .shift();
    }
}
