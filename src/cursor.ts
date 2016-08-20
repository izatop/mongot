import * as MongoDb from 'mongodb';
import {EventEmitter} from "events";

export interface Cursor<T extends Object> extends EventEmitter {
    on(event: 'data', listener: (document:T) => void): this;
}

export class Cursor<T extends Object> extends EventEmitter {
    public readonly cursor: MongoDb.Cursor;
    
    constructor(cursor: MongoDb.Cursor, transform?: <TNewDocument>(document: Object) => TNewDocument) {
        super();
        
        if (typeof transform !== 'function') {
            cursor.map(transform);
        }
        
        this.cursor = cursor;
        this.cursor.on('data', document => this.emit('data', document));
        this.cursor.on('error', err => this.emit('error', err));
        this.cursor.on('end', () => this.emit('end'));
        this.cursor.on('readable', () => this.emit('readable'));
    }
    
    count(applySkipLimit: boolean, options: MongoDb.CursorCommentOptions): Promise<number> {
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
    
    exec(): Promise<T[]> {
        this.cursor.rewind();
        return this.cursor.toArray();
    }
    
    fetch(): Promise<T> {
        return this.cursor.next();
    }
}
