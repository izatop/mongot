"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const collection_1 = require("../collection");
const TestDocument_1 = require("./TestDocument");
let TestCollection = class TestCollection extends collection_1.Collection {
    findNumbersBetweenTwoValues(start, end) {
        return this.find({ number: { $lt: start, $gt: end } });
    }
};
TestCollection = __decorate([
    schema_1.index({ number: -1 }),
    schema_1.index('randomUniqueKey', { unique: true }),
    schema_1.indexes(['number'], [{ name: -1, date: 1 }, { sparse: true }]),
    schema_1.collection('foo', TestDocument_1.TestDocument)
], TestCollection);
exports.TestCollection = TestCollection;
//# sourceMappingURL=TestCollection.js.map