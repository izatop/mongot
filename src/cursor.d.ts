/// <reference types="node" />
import * as MongoDb from 'mongodb';
import { EventEmitter } from "events";
export interface Cursor<T extends Object> extends EventEmitter {
    on(event: 'data', listener: (document: T) => void): this;
}
export declare class Cursor<T extends Object> extends EventEmitter {
    readonly cursor: MongoDb.Cursor;
    private cast;
    /**
     * @param cursor
     * @param transform
     */
    constructor(cursor: MongoDb.Cursor, transform?: <TNewDocument>(document: Object) => TNewDocument);
    /**
     * @returns {Cursor<T>}
     */
    clone(): Cursor<T>;
    /**
     * @returns {Cursor}
     */
    rewind(): this;
    /**
     * @param applySkipLimit
     * @param options
     * @returns {Promise<number>}
     */
    count(applySkipLimit?: boolean, options?: MongoDb.CursorCommentOptions): Promise<number>;
    /**
     * @param fields
     * @returns {Cursor}
     */
    project(fields: Object | string): this;
    /**
     * @param value
     * @returns {Cursor}
     */
    limit(value: number): this;
    /**
     * @param value
     * @returns {Cursor}
     */
    skip(value: number): this;
    /**
     * @param fn
     * @returns {Cursor<TMutate>}
     */
    map<TMutate>(fn: Function): Cursor<TMutate>;
    /**
     * @param value
     * @returns {Cursor}
     */
    max(value: number): this;
    /**
     * @param value
     * @returns {Cursor}
     */
    min(value: number): this;
    /**
     * @param value
     * @returns {Cursor}
     */
    sort(value: {
        [key: string]: number;
    }): this;
    /**
     * @deprecated A hasNext() method in some combination with fetch causes error "cursor is exhausted".
     *
     * @returns {Promise<boolean>}
     */
    hasNext(): Promise<boolean>;
    /**
     * @returns {Promise<T>}
     */
    fetch(): Promise<T>;
    /**
     * @returns {Promise<T[]>}
     */
    fetchAll(): Promise<T[]>;
}
