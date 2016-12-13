"use strict";
const test = require("tape");
const connection_1 = require("./connection");
const index_1 = require("./index");
const mongodb_1 = require("mongodb");
test('Repository', t => {
    const connection1 = new index_1.Repository('mongodb://localhost/test');
    t.ok(connection1.state instanceof Promise, 'State should be a promise');
    connection1.state.then(connection => {
        t.ok(connection instanceof connection_1.Connection, 'Should connect to MongoDb');
        connection1.destroy();
        const connection2 = new index_1.Repository('mongodb://unknown/unknown?connectTimeoutMS=100');
        connection2.state.catch(error => {
            t.ok(error instanceof mongodb_1.MongoError, 'Should throw an error with broken uri');
            connection2.destroy();
            t.end();
        });
    });
});
//# sourceMappingURL=index.spec.js.map