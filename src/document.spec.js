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
const wrap_1 = require("./spec/wrap");
const connect_1 = require("./spec/connect");
const TestCollection_1 = require("./spec/TestCollection");
wrap_1.default('Document Merge', (t) => __awaiter(this, void 0, void 0, function* () {
    const collection = connect_1.default('document-test').get(TestCollection_1.TestCollection);
    const document = collection.factory({
        name: 'foo',
        defaults: { min: 100, max: 200 },
        children: [{ min: 1, max: 2 }],
        deep: {
            bar: [
                { baz: '1' }
            ]
        },
        someId: "555330303030303331323132",
        any: {
            foo: 1
        }
    });
    document.merge({
        name: 'bar',
        defaults: {
            max: 1000
        },
        children: [{ min: 9, max: 99 }],
        listOfNumbers: [999],
        any: {
            bar: 2
        },
        deep: {
            bar: {
                baz: '2',
                child: [{ min: 1, max: 2 }]
            }
        }
    });
    t.same(document.children.toJSON(), [{ min: 9, max: 99 }]);
    t.equal(document.name, 'bar');
    t.equal(document.defaults.max, 1000);
    t.same(document.listOfNumbers, [999]);
    t.same(document.any, { foo: 1, bar: 2 });
    t.same(document.deep.toObject(), {
        bar: {
            baz: '2',
            child: [{ min: 1, max: 2 }]
        }
    });
    yield collection.drop();
    return (yield collection.connection).disconnect();
}));
//# sourceMappingURL=document.spec.js.map