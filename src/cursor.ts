import * as MongoDb from 'mongodb';
import {EventEmitter} from "events";
import {PartialDocumentFragment} from "./document";

export interface Cursor<T extends Object> extends EventEmitter {
    on(event: 'data', listener: (document:T) => void): this;
}

export class Cursor<T extends Object> extends EventEmitter {
    public readonly cursor: MongoDb.Cursor<T>;
    private cast: <TNewDocument>(document: Object) => TNewDocument = (document) => document;

    /**
     * @param cursor
     * @param transform
     */
    constructor(cursor: MongoDb.Cursor<T>, transform?: <TNewDocument>(document: Object) => TNewDocument) {
        super();

        if (typeof transform === 'function') {
            this.cast = transform;
            cursor.map(x => {
                return this.cast(x);
            });
        }

        this.cursor = cursor;
    }

    /**
     * @returns {Cursor<T>}
     */
    clone() {
        return new Cursor<T>(this.cursor.clone(), this.cast);
    }

    /**
     * @returns {Cursor<T>}
     */
    rewind() {
        this.cursor.rewind();
        return this;
    }

    /**
     * @param applySkipLimit
     * @param options
     * @returns {Promise<number>}
     */
    count(applySkipLimit?: boolean, options?: MongoDb.CursorCommentOptions): Promise<number> {
        return this.cursor.count(applySkipLimit, options);
    }

    /**
     * @param fields
     * @returns {Cursor<T>}
     */
    project(fields: Object | string) {
        const oldCast = this.cast;
        this.cast = row => {
            const formalized = oldCast(row);
            return PartialDocumentFragment.factory(
                Object.assign({}, ...Object.keys(formalized)
                    .filter(key => key in row)
                    .map(key => ({[key]: formalized[key]}))
                )
            );
        };

        if (typeof fields === 'string') {
            this.cursor.project(Object.assign({}, ...fields.split(/[\s,]*/).map(x => ({[x]: 1}))));
        } else {
            this.cursor.project(fields);
        }

        return this;
    }

    /**
     * @param value
     * @returns {Cursor<T>}
     */
    limit(value: number): this {
        this.cursor.limit(value);
        return this;
    }

    /**
     * @param value
     * @returns {Cursor<T>}
     */
    skip(value: number): this {
        this.cursor.skip(value);
        return this;
    }

    /**
     * @param fn
     * @returns {Cursor<TMutate>}
     */
    map<TMutate extends Object>(fn: <N,T>(v: N) => T): Cursor<TMutate> {
        return new Cursor<TMutate>(<MongoDb.Cursor<TMutate>> <any> this.cursor, fn);
    }

    /**
     * @param value
     * @returns {Cursor<T>}
     */
    max(value: number): this {
        this.cursor.max(value);
        return this;
    }

    /**
     * @param value
     * @returns {Cursor<T>}
     */
    min(value: number): this {
        this.cursor.min(value);
        return this;
    }

    /**
     * @param value
     * @returns {Cursor<T>}
     */
    sort(value: {[key: string]: number}): this {
        this.cursor.sort(value);
        return this;
    }

    /**
     * @deprecated A hasNext() method in some combination with fetch causes error "cursor is exhausted".
     *
     * @returns {Promise<boolean>}
     */
    async hasNext(): Promise<boolean> {
        return this.cursor.hasNext();
    }

    /**
     * @returns {Promise<T>}
     */
    async fetch(): Promise<T> {
        if (await this.cursor.hasNext()) {
            return await this.cursor.next();
        }

        return null;
    }

    /**
     * @returns {Promise<T[]>}
     */
    async fetchAll(): Promise<T[]> {
        this.rewind();
        const result:T[] = [];
        while(await this.cursor.hasNext()) {
            result.push(await this.cursor.next());
        }

        return result;
    }
}
