# MongoT

A lightweight ODM for MongoDb made to help you describe a document schemas in TypeScript.

## Install

`npm i -S mongot`

## Requirements

 * NodeJS 4+
 * TypeScript 2.1+
 * TypeScript options `emitDecoratorMetadata` and `experimentalDecorators` must be enabled in `tsconfig.json`

## Usage

### Collections

A collection is a class which support CRUD operations for own 
documents.

#### Create a collection

Let's create a simple collection and name it as `UserCollection`:

```ts
# UserCollection.ts
import {Collection, collection} from 'mongot'; 
import {UserDocument} from './UserDocument';

@index('login', {unique: true})
@collection('users', UserDocument)
class UserCollection extends Collection<UserDocument> {
    findByEmail(email: string) {
        return this.findOne({email});
    }
}

```

Any collections should refer to their own document schemas so 
we link the class `UserCollection` to a `users` collection in 
database and a `UserDocument` schema by a `@collection` decorator.

### Document Schema

A document class describes a schema (document properties, getters/setters,
hooks for insertions/updates and helper functions).

Schema supports these types: `ObjectID`, `string`, `boolean`, `number`, 
`date`, `Object`, `SchemaFragment` (also known as sub-document) 
and `array`. A `buffer` type doesn't tested at this time.

#### Create schema

To describe schema you need write a class with
some properties decorated with `@prop` decorator
and define property type. Just look at UserDocument
schema example:
 

```ts
# UserDocument.ts
import {SchemaDocument, SchemaFragment, Events} from 'mongot';
import {hook, prop, document} from 'mongot';
import * as crypto from 'crypto';

@fragment
class UserContactsFragment extends SchemaFragment {
    type: 'phone' | 'email' | 'im';
    title: string;
    value: string;
}

@document
class UserDocument extends SchemaDocument {
    @prop 
    public email: string;
    
    @prop 
    public password: string;
    
    @prop
    public firstName: string;
    
    @prop
    public lastName: string;
    
    @prop 
    registered: Date = new Date();
    
    @prop 
    updated: Date;
    
    @prop(UserContactsFragment) 
    children: SchemaFragmentArray<UserContactsFragment>;
    
    @hook(Events.beforeUpdate)
    refreshUpdated() {
        this.updated = new Date();
    }
    
    get displayName() {
        return [this.firstName, this.lastName]
            .filter(x => !!x)
            .join(' ') || 'Unknown';
    }
    
    checkPassword(password: string) {
        return this.password === crypto.createHash('sha1')
            .update(password)
            .digest('hex');
    }
}

```

### Usage


#### Repository

Repository is an util for creating connections to server
and get connected collections.

Example:

```ts
# index.ts
import {Repository} from 'mongot';

const options = {};
const repository = new Repository('mongodb://localhost/test', options);
```

The `Repository` class constructor has same arguments that 
MongoClient.


#### Documents

You can create documents in two ways.

Using `Collection.factory` method: 

```ts
# document-factory.ts
import {Repository} from 'mongot';
import {UserCollection} from './UserCollection';

const repository = new Repository('mongodb://localhost/test', {});

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = users.factory({
        email: 'username@example.com',
        firstName: 'Bob'
    });
    
    console.log(user);

    // saving document
    await users.save(user);
}

main();
```

Using `DocumentSchema` constructor:

```ts
# document-constructor.ts
import {Repository} from 'mongot';
import {UserCollection} from './UserCollection';

const repository = new Repository('mongodb://localhost/test', {});

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = new UsersDocument({
        email: 'username@example.com',
        firstName: 'Bob'
    });
    
    // or UsersDocument.factory(...)
    
    console.log(user);

    // saving document
    await users.save(user);
}

main();
```

##### Safe merging

When you need update a document you can use
safe document merging:

```ts
# document-safe-merging.ts
import {Repository} from 'mongot';
import {UserCollection} from './UserCollection';

const repository = new Repository('mongodb://localhost/test', {});

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = users.findOne();
    
    user.merge({lastName: 'Bond'});
    
    // save changes
    users.save(user);
}

main();
```

This method saves data described in document schema only.

#### Read queries

Get connected collection to execute find query over:

```ts
# find.ts
import {Repository} from 'mongot';
import {UserCollection} from './UserCollection';

const repository = new Repository('mongodb://localhost/test', {});

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = await users.findByEmail('username@example.com');
    
    console.log(user);
}

main();
```

You can use any of these `Collection` methods for querying: `findOne`, `find` and `aggregate` (see specs for help). 

#### Write queries 

```ts
# update.ts
import {Repository, ObjectID} from 'mongot';
import {UserCollection} from './UserCollection';

const options = {};
const repository = new Repository('mongodb://localhost/test', options);

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = await users.findOne();
    user.updated = new Date();
    users.save(user);
}

main();
```

`Collection` method `save` saves any data for `DocumentSchema` types.
You also can use these `Collection` methods:
`updateOne`, `findOneAndUpdate`, `updateMany` (see specs for help);

#### Partial

You can use projection and aggregation with partial schemas:

```ts
# partial.ts
import {PartialDocumentFragment, prop} from 'mongot';
import {UserCollection} from './UserCollection';

// initialize repo ...

@fragment
class PartialUser extends PartialDocumentFragment {
    @prop email: strng;
    @prop created: Date;
}

(async function() {
    const Users = repository.get(UserCollection);
    const partialUser = await (await Users.find())
        .map(doc => PartialUser.factory(doc))
        .project<PartialUser>({email, created})
        .fetch();
    
    console.log(partialUser instanceof PartialDocumentFragment); // true
)();
```

#### Virtual getter

You can mark a schema getter by `@virtual` decorator if you want to 
serialize the getter value with `toJSON()` or `toObject()`.
 
Example
```ts

@document
class UserDocument extends SchemaDocument {
    @prop firstName: string;
    @prop lastName?: string;
    
    @virtual get displayName(): string {
        return [this.firstName, this.lastName]
            .filter(x => !!x)
            .join(' ')
    }
}

const user = new UserDocument({firstName: 'User', lastName: 'Name'});
console.log(JSON.stringify(user));
```

you'll get

```json
{
  "firstName": "User",
  "lastName": "Name",
  "displayName": "User Name"
}
```

## License

MIT
