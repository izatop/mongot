"use strict";
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
        this.ref[Symbol.for(document_1.PRIMARY_KEY_NAME)](this.insertedId);
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
//# sourceMappingURL=helpers.js.map