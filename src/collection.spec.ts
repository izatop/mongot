import * as test from 'tape';
import {Connection} from "./connection";
import {Collection} from './collection';
import {Cursor} from "./cursor";

test('Collection', async (t) => {
    try {
        const connectionState = Connection.connect('mongodb://localhost/test');
        const TestCollection = new Collection(connectionState, 'foo');
        const result = await TestCollection.find({});
        
        t.ok(result instanceof Cursor, 'TestCollection.find({}) should return Promise<Cursor>');
        t.ok(result.cursor, 'A result should have an original cursor');
    
        (await connectionState).disconnect();
    } catch (error) {
        t.fail(error.stack);
    }
    
    t.end();
});
