import * as MongoDb from 'mongodb';
import {EventEmitter} from "events";
import {PartialDocumentFragment} from "./document";

export interface Cursor<T extends Object> extends EventEmitter {
    on(event: 'data', listener: (document:T) => void): this;
}

export class Cursor<T extends Object> extends EventEmitter {
    public readonly cursor: MongoDb.Cursor;
    private cast: <TNewDocument>(document: Object) => TNewDocument = (document) => document;
    
    constructor(cursor: MongoDb.Cursor, transform?: <TNewDocument>(document: Object) => TNewDocument) {
        super();
        
        if (typeof transform === 'function') {
            this.cast = transform;
            cursor.map(x => {
                return this.cast(x);
            });
        }
        
        this.cursor = cursor;
    }
    
    clone() {
        return new Cursor<T>(this.cursor.clone(), this.cast);
    }
    
    rewind() {
        this.cursor.rewind();
        return this;
    }
    
    count(applySkipLimit?: boolean, options?: MongoDb.CursorCommentOptions): Promise<number> {
        return this.cursor.count(applySkipLimit, options);
    }
    
    project(fields: Object | string) {
        this.cast = x => PartialDocumentFragment.factory(x);
        if (typeof fields === 'string') {
            this.cursor.project(Object.assign({}, ...fields.split(/[\s,]*/).map(x => ({[x]: 1}))));
        } else {
            this.cursor.project(fields);
        }
        
        return this;
    }
    
    limit(value: number): this {
        this.cursor.limit(value);
        return this;
    }
    
    skip(value: number): this {
        this.cursor.skip(value);
        return this;
    }
    
    map<TMutate>(fn: Function): Cursor<TMutate> {
        this.cursor.map(fn);
        return new Cursor<TMutate>(this.cursor);
    }
    
    max(value: number): this {
        this.cursor.max(value);
        return this;
    }
    
    min(value: number): this {
        this.cursor.min(value);
        return this;
    }
    
    sort(value: {[key: string]: number}): this {
        this.cursor.sort(value);
        return this;
    }
    
    async hasNext(): Promise<boolean> {
        return this.cursor.hasNext();
    }
    
    async fetch(): Promise<T> {
        if (await this.cursor.hasNext()) {
            return await this.cursor.next();
        }
        
        return null;
    }
    
    async fetchAll(): Promise<T[]> {
        this.rewind();
        const result:T[] = [];
        while(await this.cursor.hasNext()) {
            result.push(await this.cursor.next());
        }
        
        return result;
    }
}
