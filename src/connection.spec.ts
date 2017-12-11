import * as test from 'tape';
import * as MongoDb from 'mongodb';
import {Connection} from "./connection";

test('Connection', async (t) => {
    const conn = await Connection.connect(null, 'mongodb://localhost/test?');
    const foo = await conn.get('foo');
    
    t.ok(conn.db instanceof MongoDb.Db, 'conn.db should be instance of MongoDb.Db');
    t.same(foo.namespace, 'test.foo', 'foo.namespace should be `test.foo`');
    
    await conn.disconnect();
    t.end();
});
