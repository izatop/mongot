import {ObjectID} from "mongodb";
import {ok} from 'assert';
import {MetadataStore} from "./metadata/store";
import {EventEmitter} from "events";

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
                
                return Object.assign(
                    {},
                    ...Object.keys(value)
                        .map(key => ({[key]: TypeCast.toPlainValue(value[key])}))
                );
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

export class SchemaMetadata {
    readonly _id?: ObjectID;
    
    constructor(document?: Object) {
        Object.defineProperty(this, Symbol.for('id'), {value: undefined, configurable: false, writable: true});
        Object.defineProperty(this, '_id', {
            get() {
                return this[Symbol.for('id')];
            },
            set(value: ObjectID) {
                this[Symbol.for('id')] = value;
            },
            enumerable: true,
            configurable: false
        });
        
        Object.assign(this, document);
    }
    
    toObject() {
        const properties = [];
        Object.keys(this)
            .forEach(key => {
                // Allow assigned values only
                if (typeof this[key] !== 'undefined') {
                    properties.push({[key]: TypeCast.toPlainValue(this[key])});
                }
            });
        
        return Object.assign({}, ...properties);
    }

    toJSON() {
        return this.toObject();
    }
    
    protected upgrade(document?: Object) {
        const merge = Object.assign({}, this, document);
        const metadata = this.getMetadata();
        
        ok(!!metadata, `Metadata does not defined for ${this.constructor.name}`);
        
        metadata.forEach(({type, proto}, key: string) => {
            const storageKey = Symbol(key);
            Object.defineProperty(this, storageKey, {value: undefined, writable: true, configurable: false});
            Object.defineProperty(this, key, {
                get: (): any => this[storageKey],
                set: (newValue): void => {
                    this[storageKey] = TypeCast.cast(type, newValue, proto);
                },
                enumerable: true,
                configurable: false
            });
        });
        
        Object.keys(merge).forEach(key => {
            if (!Object.getOwnPropertyDescriptor(this, key)) {
                throw new Error(`Unknown ${this.constructor.name} property: ${key}`);
            }
            
            this[key] = merge[key];
        });
    }
    
    static factory<T extends SchemaMetadata>(document?: Object): T {
        const instance = new this(document);
        instance.upgrade(document);
        return instance as T;
    }
    
    protected getMetadata() {
        if (this instanceof PartialDocument) {
            const obj = Object.keys(this).filter(x => x !== '_id').map(x => ([x, {type: Object, proto: Object}]));
            return new Map([...obj]);
        }
        
        return MetadataStore.getSchemaMetadata(<typeof SchemaMetadata> (this.constructor));
    }
    
    protected getPropertyMetadata(property: any) {
        return MetadataStore.getSchemaPropertyMetadata(<typeof SchemaMetadata> (this.constructor), property);
    }
    
    protected getDefinedHooks(): string[] {
        return MetadataStore.getSchemaHookMetadata(<typeof SchemaMetadata> (this.constructor));
    }
}

export class SchemaDocument extends SchemaMetadata {
    readonly _id: ObjectID;
    
    getEventListener(): EventEmitter {
        const emitter = new EventEmitter();
        this.getDefinedHooks().forEach(hook => {
            if (typeof this[hook] === 'function') {
                emitter.on(hook, () => this[hook]());
            }
        });
        
        return emitter;
    }
    
    protected beforeInsert(): void {}
    protected beforeUpdate(): void {}
    protected beforeDelete(): void {}
    
    protected afterInsert(): void {}
    protected afterUpdate(): void {}
    protected afterDelete(): void {}
}

export class SchemaFragment extends SchemaMetadata {
    readonly _id?: ObjectID;
}

export class PartialDocument extends SchemaDocument {}

export class SchemaArray<T> extends Array<T> {
    protected readonly cast: (value: any) => T;
    
    constructor(values?: T[], cast?: (value: any) => T) {
        super();
        this.cast = cast ? cast : x => x as T;
        if (values && typeof values === 'object') {
            [...values].forEach(value => this.push(value));
        }
    }
    
    toArray() {
        return [...this].map(value => TypeCast.toPlainValue(value));
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

