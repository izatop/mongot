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
const document_1 = require("../document");
class UpdateResult {
    constructor({ matchedCount, modifiedCount, upsertedCount, upsertedId }) {
        this.matched = matchedCount;
        this.modified = modifiedCount;
        this.upserted = upsertedCount;
        if (upsertedId) {
            this.upsertedId = upsertedId._id;
        }
    }
}
exports.UpdateResult = UpdateResult;
class InsertResult {
    constructor({ insertedId }, document) {
        this.insertedId = insertedId;
        this.ref = document;
        this.ref[Symbol.for(document_1.PRIMARY_KEY_NAME)] = this.insertedId;
    }
}
exports.InsertResult = InsertResult;
class DeleteResult {
    constructor({ deletedCount }) {
        this.count = deletedCount;
    }
}
exports.DeleteResult = DeleteResult;
class FindAndModifyResult {
    constructor({ lastErrorObject, factory, value }) {
        this.ref = null;
        this.lastError = lastErrorObject;
        if (!!value) {
            this.ref = factory(value);
        }
    }
    has() {
        return !!this.ref;
    }
    get() {
        return this.ref;
    }
}
exports.FindAndModifyResult = FindAndModifyResult;
exports.createNextAutoIncrementNumber = (collection) => __awaiter(this, void 0, void 0, function* () {
    const { db } = yield collection.connection;
    const res = yield db.collection('mongot.counter').findOneAndUpdate({
        _id: collection.name
    }, {
        $inc: { seq: 1 }
    }, {
        upsert: true,
        returnOriginal: false
    });
    return res.value.seq;
});
//# sourceMappingURL=helpers.js.map