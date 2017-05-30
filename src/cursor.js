"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const document_1 = require("./document");
class Cursor extends events_1.EventEmitter {
    /**
     * @param cursor
     * @param transform
     */
    constructor(cursor, transform) {
        super();
        this.cast = (document) => document;
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
        return new Cursor(this.cursor.clone(), this.cast);
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
    count(applySkipLimit, options) {
        return this.cursor.count(applySkipLimit, options);
    }
    /**
     * @param fields
     * @returns {Cursor<T>}
     */
    project(fields) {
        const oldCast = this.cast;
        this.cast = row => {
            const formalized = oldCast(row);
            return document_1.PartialDocumentFragment.factory(Object.assign({}, ...Object.keys(formalized)
                .filter(key => key in row)
                .map(key => ({ [key]: formalized[key] }))));
        };
        if (typeof fields === 'string') {
            this.cursor.project(Object.assign({}, ...fields.split(/[\s,]*/).map(x => ({ [x]: 1 }))));
        }
        else {
            this.cursor.project(fields);
        }
        return this;
    }
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    limit(value) {
        this.cursor.limit(value);
        return this;
    }
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    skip(value) {
        this.cursor.skip(value);
        return this;
    }
    /**
     * @param fn
     * @returns {Cursor<TMutate>}
     */
    map(fn) {
        return new Cursor(this.cursor, fn);
    }
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    max(value) {
        this.cursor.max(value);
        return this;
    }
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    min(value) {
        this.cursor.min(value);
        return this;
    }
    /**
     * @param value
     * @returns {Cursor<T>}
     */
    sort(value) {
        this.cursor.sort(value);
        return this;
    }
    /**
     * @deprecated A hasNext() method in some combination with fetch causes error "cursor is exhausted".
     *
     * @returns {Promise<boolean>}
     */
    hasNext() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cursor.hasNext();
        });
    }
    /**
     * @returns {Promise<T>}
     */
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.cursor.hasNext()) {
                return yield this.cursor.next();
            }
            return null;
        });
    }
    /**
     * @returns {Promise<T[]>}
     */
    fetchAll() {
        return __awaiter(this, void 0, void 0, function* () {
            this.rewind();
            const result = [];
            while (yield this.cursor.hasNext()) {
                result.push(yield this.cursor.next());
            }
            return result;
        });
    }
}
exports.Cursor = Cursor;
//# sourceMappingURL=cursor.js.map