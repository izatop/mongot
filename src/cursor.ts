import * as MongoDb from 'mongodb';
import {EventEmitter} from "events";

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
                return transform(x);
            });
        }
        
        this.cursor = cursor;
        this.cursor.on('data', document => this.emit('data', document));
        this.cursor.on('error', err => this.emit('error', err));
        this.cursor.on('end', () => this.emit('end'));
        this.cursor.on('readable', () => this.emit('readable'));
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
    
    fetch(): Promise<T> {
        return this.cursor.next();
    }
    
    fetchAll(): Promise<T[]> {
        this.cursor.rewind();
        return this.cursor.toArray() as Promise<T[]>;
    }
}
