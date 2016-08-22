import test from './spec/wrap';
import repo from './spec/connect';
import {TestCollection} from './spec/TestCollection';
import {TestDocument, ChildFragment} from './spec/TestDocument';

test('Schema', async (t) => {
    const collection = repo().get(TestCollection);
    const document = collection.factory({
        name: 'foo',
        defaults: {min: 100, max: 200},
        children: [{min: 1, max: 2}]
    });
    
    document.children.push({min: 3, max: 4});
    document.listOfNumbers.push(4);
    
    t.ok(document instanceof TestDocument, 'TestCollection.factory() should return instance of the TestDocument class');
    t.ok(typeof document.number === 'number', 'TestDocument.number should be a number');
    t.ok(document.defaults instanceof ChildFragment, 'TestDocument.defaults should be ChildFragment');
    t.same(document.defaults.toObject(), {min: 100, max: 200}, 'TestDocument.defaults should match');
    t.equals(document.name, 'foo', 'TestDocument.name should match');
    t.equals(document.optional, undefined, 'TestDocument.optional should match');
    t.ok(document.children.filter(x => x instanceof ChildFragment), 'TestDocument.children should be ChildFragment[]');
    t.same(document.children.toArray(), [{min: 1, max: 2}, {min: 3, max: 4}], 'TestDocument.children should match');
    t.same(document.listOfNumbers.toArray(), [1, 2, 3, 4], 'TestDocument.listOfNumbers should match');
    t.equals(document.version, 0, 'TestDocument.version should match');
    t.same(document.any, {}, 'TestDocument.any should match');
    t.equals(document.sum, 10, 'TestDocument.sum should match');
    t.equals(document.deep.bar.baz, 'hello', 'TestDocument.deep.bar.baz should match');
    
    document.getEventListener().emit('beforeInsert', []);
    t.equals(document.version, 1, 'TestDocument.version should be increased by beforeInsert hook');
    
    return (await collection.connection).disconnect();
});
