import * as test from 'tape';
import {Connection} from "./connection";
import {Repository} from "./index";
import {MongoError} from "mongodb";

test('Repository', t => {
    const connection1 = new Repository('mongodb://localhost/test');
    
    t.ok(connection1.state instanceof Promise, 'State should be a promise');
    connection1.state.then(connection => {
        t.ok(connection instanceof Connection, 'Should connect to MongoDb');
        connection1.destroy();
        
        const connection2 = new Repository('mongodb://unknown/unknown?connectTimeoutMS=100');
        connection2.state.catch(error => {
            t.ok(error instanceof MongoError, 'Should throw an error with broken uri');
            connection2.destroy();
            
            t.end();
        });
    });
});
