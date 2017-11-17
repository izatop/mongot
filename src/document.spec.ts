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
import {TestMergeCollection} from "./spec/TestMergeCollection";
import {FragmentFragment} from "./spec/TestMergeDocument";

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
        children: [{min: 9, max: 99}],
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

    t.same(document.children.toJSON(), [{min: 9, max: 99}]);
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

test('Document Merge', async (t) => {
    const collection = repo('document-test').get(TestMergeCollection);
    const document = collection.factory({
        fragments: [
            {_id: '5a0ecd960795c64fd18b8e8b', name: '1', value: 1}
        ]
    });

    document.merge({
        fragments: [
            {_id: '5a0ecd9c0795c64fd18b8e8c', name: '2', value: 2},
            {_id: '5a0ecda10795c64fd18b8e8d', name: '3', value: 3}
        ]
    });

    t.same(document.fragments.toJSON(), [
        {_id: '5a0ecd9c0795c64fd18b8e8c', name: '2', value: 2},
        {_id: '5a0ecda10795c64fd18b8e8d', name: '3', value: 3}
    ]);

    await collection.drop();
    return (await collection.connection).disconnect();
});
