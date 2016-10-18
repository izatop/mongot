import {ObjectID} from 'mongodb';
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
            if (value instanceof ObjectID) {
                return value;
            }
            
            if (Array.isArray(value)) {
                return value.map(x => this.normalize(x));
            }
            
            return this.format(value);
        } else if (typeof value === 'string' && value.length === 24 && /^[0-9a-f]{24}$/.test(value) === true) {
            return ObjectID.createFromHexString(value);
        }
        
        return value;
    }
    
    format(query?: Object) {
        const data = query || this.query;
        return Object.assign({}, ...Object.keys(data).map(key => ({[key]: this.normalize(data[key])})));
    }
}
