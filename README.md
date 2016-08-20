# MongoT

A lightweight typed MongoDb library for TypeScript.

## Install

`npm i -S mongot`

## Usage

First connect to a mongodb:

```ts
# index.ts
import {Repository} from 'mongot';

const repository = new Repository('mongodb://localhost/test');
```

There are available any variants of the MongoClient arguments.

Next create your schemas.

### Define Collection

A collection is a factory to read/update/remove documents. 
```ts
# UserCollection.ts
import {Collection, collection} from 'mongot'; 
import {UserDocument} from './UserDocument';

@collection('users', UserDocument)
class UserCollection extends Collection<UserDocument> {
    findByEmail(email: string) {
        return this.findOne({email});
    }
}

```

### Define Document

```ts
# UserDocument.ts
import {hook, prop, SchemaDocument} from 'mongot';

@unique({email: -1})
class UserDocument extends SchemaDocument {
    @prop @req firstName: string;
    @prop lastName: string;
    
    @prop @req email: string;
    
    @prop registered: Date = new Date(); // default value
    @prop updated: Date;
    
    @hook
    updateBefore() {
        this.updated = new Date();
    }
    
    get displayName() {
        return this.firstName + 
            (this.lastName ? ' ' + this.lastName : '');
    }
}

```

### Connecting a collection to repository

Before querying we should connect a collection to the repository
instance:

```ts
# index.ts

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = await users.findByEmail('mongot@example.com');
    
    console.log(user.displayName);
}

main();
```

## Documentation

Coming soon... maybe

## Vanilla

You can if you know how it cook.
