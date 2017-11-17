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
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("../document");
const schema_1 = require("../schema");
const schema_2 = require("../schema");
let FragmentFragment = class FragmentFragment extends document_1.SchemaFragment {
};
__decorate([
    schema_1.prop,
    __metadata("design:type", String)
], FragmentFragment.prototype, "name", void 0);
__decorate([
    schema_1.prop,
    __metadata("design:type", Number)
], FragmentFragment.prototype, "value", void 0);
FragmentFragment = __decorate([
    schema_1.fragment
], FragmentFragment);
exports.FragmentFragment = FragmentFragment;
let TestMergeDocument = class TestMergeDocument extends document_1.SchemaDocument {
};
__decorate([
    schema_1.prop(FragmentFragment),
    __metadata("design:type", document_1.SchemaFragmentArray)
], TestMergeDocument.prototype, "fragments", void 0);
TestMergeDocument = __decorate([
    schema_2.document
], TestMergeDocument);
exports.TestMergeDocument = TestMergeDocument;
//# sourceMappingURL=TestMergeDocument.js.map