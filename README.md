# MongoT

A lightweight typed MongoDb library for TypeScript.

## Install

`npm i -S mongot`

## Usage

### Collections

A collection is a class which support CRUD operations for own 
documents.

#### Create a collection example

```ts
# UserCollection.ts
import {Collection, collection} from 'mongot'; 
import {UserDocument} from './UserDocument';

@collection('users', UserDocument) // bind to a document schema
class UserCollection extends Collection<UserDocument> {
    findByEmail(email: string) {
        return this.findOne({email});
    }
}

```

### Document Schema

Document schemas support following types: `string`, `boolean`, `number`,
`date`, `Object` (any), `SchemaFragment` (also known as subdocument), 
`array` type may contain any of these type. 
`Buffer` didn't tested at this time.

Any type can be defined via a function decorator `@prop`:

```ts
    @prop fieldName: string
```

For arrays you need pass a proto to the function decorator `@prop`
like as:

```ts
    @prop(Date) loginDates: SchemaArray<Date> = new SchemaArray();
```

#### Create a document example

```ts
# UserDocument.ts
import {hook, prop, SchemaDocument} from 'mongot';

@unique({email: -1})
class UserDocument extends SchemaDocument {
    @prop firstName: string;
    @prop lastName: string;
    
    @prop @req email: string;
    
    @prop registered: Date = new Date(); // default value
    @prop updated: Date;
    
    @hook
    beforeUpdate() {
        this.updated = new Date();
    }
    
    get displayName() {
        return this.firstName + 
            (this.lastName ? ' ' + this.lastName : '');
    }
}

```

### Create a repository

To connect your collections to MongoDb you should create a repository:

```ts
# index.ts
import {Repository} from 'mongot';

const options = {};
const repository = new Repository('mongodb://localhost/test', options);
```

The `Repository` class constructor has same arguments that MongoClient.

### Querying

Before querying you should get a collection instance via 
`Repository.get`.

```ts
# index.ts

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = await users.findByEmail('username@example.com');
    
    // do something
    ...
}
```

## Documentation

Coming soon... maybe

## Vanilla

You can if you know how it cook.

## License

MIT
