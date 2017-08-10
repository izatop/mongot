/// <reference types="node" />
import * as MongoDb from 'mongodb';
import { EventEmitter } from "events";
export interface Cursor<T> extends EventEmitter {
    on(event: 'data', listener: (document: T) => void): this;
}
export interface CastFunction {
    <TDoc>(document: Object): TDoc;
}
export declare class Cursor<T> extends EventEmitter {
    readonly cursor: MongoDb.Cursor<T>;
    private cast;
    /**
     * @param cursor
     * @param transform
     */
    constructor(cursor: MongoDb.Cursor<T>, transform?: CastFunction);
    /**
     * @returns {Cursor<T>}
     */
    clone(): Cursor<T>;
    /**
     * @returns {Cursor<T>}
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
     * @returns {Cursor<PT>}
     */
    project<PT>(fields: Object | string): this;
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    limit(value: number): this;
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    skip(value: number): this;
    /**
     * @param fn
     * @returns {Cursor<TMutate>}
     */
    map<TMutate extends Object>(fn: <N, T>(v: N) => T): Cursor<TMutate>;
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    max(value: number): this;
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    min(value: number): this;
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    sort(value: {
        [key: string]: number;
    }): this;
    /**
     * @param hint
     * @returns {Cursor<T>}
     */
    hint(hint: {
        [key: string]: string | number;
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
