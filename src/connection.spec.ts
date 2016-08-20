import * as test from 'tape';
import * as MongoDb from 'mongodb';
import {Connection} from "./connection";

test('Connection', async (t) => {
    const conn = await Connection.connect('mongodb://localhost/test?', {server: {poolSize: 10}});
    const foo = await conn.get('foo');
    const {host, poolSize}: any = conn.db.serverConfig['s'];
    
    t.ok(conn.db instanceof MongoDb.Db, 'conn.db should be instance of MongoDb.Db');
    t.same(foo.namespace, 'test.foo', 'foo.namespace should be `test.foo`');
    t.same({host, poolSize}, {host: 'localhost', poolSize: 10}, 'Connection.connect() should pass options to MongoDb connection');
    
    await conn.disconnect();
    t.end();
});
