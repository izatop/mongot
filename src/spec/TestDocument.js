"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const document_1 = require("../document");
const schema_1 = require("../schema");
class ChildFragment extends document_1.SchemaFragment {
    get avg() {
        return (this.max - this.min) / 2;
    }
}
__decorate([
    schema_1.prop,
    __metadata("design:type", Number)
], ChildFragment.prototype, "min", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", Number)
], ChildFragment.prototype, "max", void 0);
exports.ChildFragment = ChildFragment;
class BarFragment extends document_1.SchemaFragment {
}
__decorate([
    schema_1.prop,
    __metadata("design:type", String)
], BarFragment.prototype, "baz", void 0);
exports.BarFragment = BarFragment;
class FooFragment extends document_1.SchemaFragment {
    constructor() {
        super(...arguments);
        this.bar = new BarFragment({ baz: 'hello' });
    }
}
__decorate([
    schema_1.prop,
    __metadata("design:type", BarFragment)
], FooFragment.prototype, "bar", void 0);
exports.FooFragment = FooFragment;
class TestDocument extends document_1.SchemaDocument {
    constructor() {
        super(...arguments);
        this.number = Math.random();
        this.listOfNumbers = new document_1.SchemaArray([1, 2, 3]);
        this.defaults = new ChildFragment({ min: 1, max: 10 });
        this.version = 0;
        this.any = {};
        this.deep = new FooFragment();
        this.date = new Date;
    }
    get sum() {
        return this.listOfNumbers.reduce((l, r) => l + r);
    }
    beforeInsert() {
        this.randomUniqueKey = Math.random() * 90000000;
        this.version++;
    }
}
__decorate([
    schema_1.prop,
    __metadata("design:type", Number)
], TestDocument.prototype, "randomUniqueKey", void 0);
__decorate([
    schema_1.prop, schema_1.req,
    __metadata("design:type", String)
], TestDocument.prototype, "name", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", Number)
], TestDocument.prototype, "number", void 0);
__decorate([
    schema_1.prop(Number),
    __metadata("design:type", document_1.SchemaArray)
], TestDocument.prototype, "listOfNumbers", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", ChildFragment)
], TestDocument.prototype, "defaults", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", ChildFragment)
], TestDocument.prototype, "optional", void 0);
__decorate([
    schema_1.prop(ChildFragment),
    __metadata("design:type", document_1.SchemaFragmentArray)
], TestDocument.prototype, "children", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", Number)
], TestDocument.prototype, "version", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", Object)
], TestDocument.prototype, "any", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", FooFragment)
], TestDocument.prototype, "deep", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", Date)
], TestDocument.prototype, "date", void 0);
__decorate([
    schema_1.hook,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestDocument.prototype, "beforeInsert", null);
exports.TestDocument = TestDocument;
//# sourceMappingURL=TestDocument.js.map