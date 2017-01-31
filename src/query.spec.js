"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const wrap_1 = require("./spec/wrap");
const query_1 = require("./query");
const mongodb_1 = require("mongodb");
const number = Math.random();
const filterPlain = {
    language: 'ru',
    status: true,
    child_id: {
        $in: ['584dd5fa717425e09b46b79a', '584dd5fa717425e09b46b79b', '584dd5fa717425e09b46b79c']
    },
    created: {
        $gt: (new Date).toISOString(),
        $lt: (new Date).toISOString()
    },
    deep: {
        deep: {
            number,
            deep: {
                object_id: '584dd5fa717425e09b46b79a',
                date: (new Date).toISOString()
            }
        }
    }
};
const filterFormatted = {
    language: 'ru',
    status: true,
    child_id: {
        $in: [
            mongodb_1.ObjectID.createFromHexString('584dd5fa717425e09b46b79a'),
            mongodb_1.ObjectID.createFromHexString('584dd5fa717425e09b46b79b'),
            mongodb_1.ObjectID.createFromHexString('584dd5fa717425e09b46b79c')
        ]
    },
    created: {
        $gt: new Date,
        $lt: new Date
    },
    deep: {
        deep: {
            number,
            deep: {
                object_id: mongodb_1.ObjectID.createFromHexString('584dd5fa717425e09b46b79a'),
                date: new Date()
            }
        }
    }
};
wrap_1.default('Query', (t) => __awaiter(this, void 0, void 0, function* () {
    t.same(new query_1.Query(class {
    }, {}).format(), {}, '{} should be ok');
    t.same(new query_1.Query(class {
    }, { field: 'string' }).format(), { field: 'string' }, 'String fields should be ok');
    t.ok(new query_1.Query(class {
    }, { _id: '584dd5fa717425e09b46b79c' }).format()['_id'] instanceof mongodb_1.ObjectID, 'The 24-length hex string should be ObjectID');
    t.ok(new query_1.Query(class {
    }, { _id: mongodb_1.ObjectID.createFromHexString('584dd5fa717425e09b46b79c') }).format()['_id'] instanceof mongodb_1.ObjectID, 'ObjectID should be ok');
    t.ok(new query_1.Query(class {
    }, { date: (new Date).toISOString() }).format()['date'] instanceof Date, 'The ISODate string should be Date');
    t.ok(new query_1.Query(class {
    }, { date: new Date }).format()['date'] instanceof Date, 'Date should be ok');
    t.same(new query_1.Query(class {
    }, filterPlain).format(), filterFormatted, 'Query format should return a valid object');
}));
//# sourceMappingURL=query.spec.js.map