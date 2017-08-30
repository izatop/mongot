import {ObjectID, Long} from "./schema";
import {MetadataStore} from "./metadata/store";
import {SchemaMetadata} from "./document";

export class Query {
    private meta;
    private query: Object;
    
    constructor(target: Function, query: Object) {
        this.meta = MetadataStore.getSchemaMetadata(<typeof SchemaMetadata> (target.prototype.constructor));
        this.query = query && typeof query === 'object' ? query : {};
    }
    
    private normalize(value: any) {
        if (typeof value === 'object' && value !== null) {
            if (value instanceof ObjectID || value instanceof Long) {
                return value;
            } else if (Array.isArray(value)) {
                return value.map(x => this.normalize(x));
            } else if (value instanceof Date) {
                return value;
            } else if (Object.prototype.toString.call(value) === '[object Object]') {
                return this.format(value);
            }
            
            return value;
        } else if (typeof value === 'string') {
            if (value.length === 24) {
                if ('Z' === value.substr(-1) && true === /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                    return new Date(value);
                } else if (true === /^[0-9a-f]{24}$/.test(value)) {
                    return ObjectID.createFromHexString(value);
                }
            }
                
            return value;
        }
        
        return value;
    }
    
    format(query?: Object) {
        const data = query || this.query;
        return Object.assign({}, ...Object.keys(data).map(key => ({[key]: this.normalize(data[key])})));
    }
}
