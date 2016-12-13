/// <reference types="node" />
import * as MongoDb from 'mongodb';
import { EventEmitter } from "events";
export interface Cursor<T extends Object> extends EventEmitter {
    on(event: 'data', listener: (document: T) => void): this;
}
export declare class Cursor<T extends Object> extends EventEmitter {
    readonly cursor: MongoDb.Cursor;
    private cast;
    constructor(cursor: MongoDb.Cursor, transform?: <TNewDocument>(document: Object) => TNewDocument);
    clone(): Cursor<T>;
    rewind(): this;
    count(applySkipLimit?: boolean, options?: MongoDb.CursorCommentOptions): Promise<number>;
    project(fields: Object | string): this;
    limit(value: number): this;
    skip(value: number): this;
    map<TMutate>(fn: Function): Cursor<TMutate>;
    max(value: number): this;
    min(value: number): this;
    sort(value: {
        [key: string]: number;
    }): this;
    hasNext(): Promise<boolean>;
    fetch(): Promise<T>;
    fetchAll(): Promise<T[]>;
}
