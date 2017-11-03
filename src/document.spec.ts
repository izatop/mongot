import test from './spec/wrap';
import repo from './spec/connect';
import {TestCollection} from './spec/TestCollection';
import {ChildFragment, TestDocument} from './spec/TestDocument';
import {TestBase} from "./spec/TestBase";
import {MetadataStore} from "./metadata/store";
import {TestExtend} from "./spec/TestExtend";
import {Events} from "./collection";
import {ObjectID, Long} from "./schema";
import {PRIMARY_KEY_NAME} from "./document";

test('Document Merge', async (t) => {
    const collection = repo('document-test').get(TestCollection);
    const document = collection.factory({
        name: 'foo',
        defaults: {min: 100, max: 200},
        children: [{min: 1, max: 2}],
        deep: {
            bar: [
                {baz: '1'}
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
        listOfNumbers: [999],
        any: {
            bar: 2
        },
        deep: {
            bar: {
                baz: '2',
                child: [{min: 1, max: 2}]
            }
        }
    });

    t.equal(document.name, 'bar');
    t.equal(document.defaults.max, 1000);
    t.same(document.listOfNumbers, [999]);
    t.same(document.any, {foo: 1, bar: 2});
    t.same(document.deep.toObject(), {
        bar: {
            baz: '2',
            child: [{min: 1, max: 2}]
        }
    });

    await collection.drop();
    return (await collection.connection).disconnect();
});
