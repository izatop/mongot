# MongoT

MongoT is a modern ODM library for MongoDb.

## Install

Just type `npm i -S mongot` to install this package.

## Usage

### Configure

You may need TypeScript 2+ and enable `experimentalDecorators`,
`emitDecoratorMetadata` in your `tsconfig.json`.

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

A document class describes schema fields and an entity getters/setters,
event handlers and helper functions.

Schema supports these types: `string`, `boolean`, `number`, `date`,
`Object`, `SchemaFragment` (also known as sub-document) 
and `array`. A `buffer` type doesn't tested at this time.

#### Create a document

let's look at a `UserDocument` schema:

```ts
# UserDocument.ts
import {SchemaDocument} from 'mongot';
import {hook, prop, document} from 'mongot';
import * as crypto from 'crypto';

@document
class UserDocument extends SchemaDocument {
    @prop email: string;
    @prop password: string;
    @prop firstName: string;
    @prop lastName: string;
    
    @prop registered: Date = new Date();
    @prop updated: Date;
    
    @hook
    beforeUpdate() {
        this.updated = new Date();
    }
    
    get displayName() {
        return [this.firstName, this.lastName]
            .filter(x => !!x)
            .join(' ');
    }
    
    checkPassword(password: string) {
        return this.password === crypto.createHash('sha1')
            .update(password)
            .digest('hex');
    }
}

```

### Create a repository

To connect collections to a MongoDb instance you should 
create a repository:

```ts
# index.ts
import {Repository} from 'mongot';

const options = {};
const repository = new Repository('mongodb://localhost/test', options);
```

The `Repository` class constructor has same arguments that 
MongoClient.

### Querying

Before querying you should get a connected collection:

```ts
# index.ts
import {Repository} from 'mongot';
import {UserCollection} from './UserCollection';

const options = {};
const repository = new Repository('mongodb://localhost/test', options);

async function main(): void {
    const users: UserCollection = repository.get(UserCollection);
    const user = await users.findByEmail('username@example.com');
    
    // do something with user
    ...
}
```

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

## License

MIT
