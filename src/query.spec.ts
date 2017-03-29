import test from './spec/wrap';
import {Query} from './query';
import {ObjectID} from "./schema";

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

const date1 = new Date();
const date2 = new Date();
const filterFormatted = {
    language: 'ru',
    status: true,
    child_id: {
        $in: [
            ObjectID.createFromHexString('584dd5fa717425e09b46b79a'),
            ObjectID.createFromHexString('584dd5fa717425e09b46b79b'),
            ObjectID.createFromHexString('584dd5fa717425e09b46b79c')
        ]
    },
    created: {
        $gt: date1,
        $lt: date2
    },
    deep: {
        deep: {
            number,
            deep: {
                object_id: ObjectID.createFromHexString('584dd5fa717425e09b46b79a'),
                date: date1
            }
        }
    }
};

test('Query', async (t) => {
    t.same(new Query(class {}, {}).format(), {}, '{} should be ok');
    t.same(new Query(class {}, {field: 'string'}).format(), {field: 'string'}, 'String fields should be ok');
    t.ok(new Query(class {}, {_id: '584dd5fa717425e09b46b79c'}).format()['_id'] instanceof ObjectID, 'The 24-length hex string should be ObjectID');
    t.ok(new Query(class {}, {_id: ObjectID.createFromHexString('584dd5fa717425e09b46b79c')}).format()['_id'] instanceof ObjectID, 'ObjectID should be ok');
    t.ok(new Query(class {}, {date: (new Date).toISOString()}).format()['date'] instanceof Date, 'The ISODate string should be Date');
    t.ok(new Query(class {}, {date: new Date}).format()['date'] instanceof Date, 'Date should be ok');

    t.same(new Query(class {}, filterPlain).format(), filterFormatted, 'Query format should return a valid object');
});
