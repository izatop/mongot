"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const events_1 = require("events");
const document_1 = require("./document");
class Cursor extends events_1.EventEmitter {
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
    clone() {
        return new Cursor(this.cursor.clone(), this.cast);
    }
    rewind() {
        this.cursor.rewind();
        return this;
    }
    count(applySkipLimit, options) {
        return this.cursor.count(applySkipLimit, options);
    }
    project(fields) {
        this.cast = x => document_1.PartialDocumentFragment.factory(x);
        if (typeof fields === 'string') {
            this.cursor.project(Object.assign({}, ...fields.split(/[\s,]*/).map(x => ({ [x]: 1 }))));
        }
        else {
            this.cursor.project(fields);
        }
        return this;
    }
    limit(value) {
        this.cursor.limit(value);
        return this;
    }
    skip(value) {
        this.cursor.skip(value);
        return this;
    }
    map(fn) {
        this.cursor.map(fn);
        return new Cursor(this.cursor);
    }
    max(value) {
        this.cursor.max(value);
        return this;
    }
    min(value) {
        this.cursor.min(value);
        return this;
    }
    sort(value) {
        this.cursor.sort(value);
        return this;
    }
    hasNext() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cursor.hasNext();
        });
    }
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.cursor.hasNext()) {
                return yield this.cursor.next();
            }
            return null;
        });
    }
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