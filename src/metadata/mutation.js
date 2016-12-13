"use strict";

class SchemaMutate {
    constructor(document) {
        if (typeof document === 'object' && document !== null) {
            throw new Error(`You should use Document.factory() or decorate your schemas with @document/@fragment.`);
        }
    }

    __mutate(document) {
        throw new Error('Schema should implement the __mutate() method');
    }
}

module.exports = {
    SchemaMutate
};