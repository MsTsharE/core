<h1 align="center">Welcome to @kv-orm/core 👋</h1>
<p>
  <a href="https://github.com/kv-orm/core/actions" target="_blank">
    <img alt="GitHub Actions Checks" src="https://github.com/kv-orm/core/workflows/Test/badge.svg">
  </a>
  <a href="https://lgtm.com/projects/g/kv-orm/core/alerts/" target="_blank">
    <img alt="LGTM Alerts" src="https://img.shields.io/lgtm/alerts/g/kv-orm/core.svg?logo=lgtm&style=plastic">
  </a>
  <a href="https://codecov.io/gh/kv-orm/core" target="_blank">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/kv-orm/core?logo=codecov&style=plastic">
  </a>
  <a href="https://lgtm.com/projects/g/kv-orm/core/context:javascript" target="_blank">
    <img alt="LGTM Code Quality" src="https://img.shields.io/lgtm/grade/javascript/g/kv-orm/core.svg?logo=lgtm&style=plastic">
  </a>
  <a href="https://github.com/kv-orm/core/packages" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/kv-orm/core?style=plastic" />
  </a>
  <a href="https://github.com/kv-orm/core/blob/master/LICENSE" target="_blank">
    <img alt="License" src="https://img.shields.io/github/license/kv-orm/core?style=plastic" />
  </a>
  <a href="https://greenkeeper.io" target="_blank">
    <img alt="Greenkeeper" src="https://badges.greenkeeper.io/kv-orm/core.svg?style=plastic">
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img alt="Types" src="https://img.shields.io/npm/types/kv-orm.svg?style=plastic">
  </a>
  <a href="https://github.com/kv-orm/core" target="_blank">
    <img alt="GitHub Last Commit" src="https://img.shields.io/github/last-commit/kv-orm/core.svg?logo=github&style=plastic" />
  </a>
</p>

[kv-orm] is an Node.JS [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) for [key-value datastores](https://en.wikipedia.org/wiki/Key-value_database). **It is currently in alpha**.

## Author

👤 **Greg Brimble**

- Github: [@GregBrimble](https://github.com/GregBrimble)
- Personal Website: [https://gregbrimble.com/](https://gregbrimble.com/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/kv-orm/core/issues).

## 😍 Show your support

Please consider giving this project a <a href="https://github.com/kv-orm/core/stargazers" target="_blank" title="Thank you!">⭐️</a> if you use it, or if it provides some inspiration!

# Supported Datastores

- In-Memory
- [Cloudflare Workers KV](https://github.com/kv-orm/cf-workers)

If there is any other datastore that you'd like to see supported, please [create an issue](https://github.com/kv-orm/core/issues/new), or [make a pull request](https://github.com/kv-orm/core/fork).

# Features

- Support for multiple key-value datastores in a single application.

  ```typescript
  import { MemoryDatastore } from '@kv-orm/core'

  const libraryDatastore = new MemoryDatastore()
  const applicationSecrets = new MemoryDatastore()
  ```

  See above for the full list of [Supported Datastores](#Supported%20Datastores).

- Easy construction of typed Entities using [Typescript](https://www.typescriptlang.org/).

  ```typescript
  import { Column, Entity } from '@kv-orm/core'

  @Entity({ datastore: libraryDatastore })
  class Author {
    @Column()
    public firstName: string

    @Column()
    public lastName: string

    // ...
  }
  ```

- On-demand, lazy-loading: [kv-orm] won't load properties of an Entity until they're needed, and will do so seamlessly at the time of lookup.

  ```typescript
  import { getRepository } from '@kv-orm/core'

  const authorRepository = getRepository(Author)

  let author = await authorRepository.load('william@shakespeare.com') // 1ms - no properties of the author have been loaded

  console.log(await author.firstName) // 60ms - author.firstName is fetched
  ```

- No unnecessary reads: if a property is already in memory, [kv-orm] won't look it up again unless it needs to.

  ```typescript
  let author = await authorRepository.load('william@shakespeare.com')

  console.log(await author.lastName) // 60ms - author.lastName is fetched
  console.log(await author.lastName) // 1ms - author.lastName is retrieved from memory (no lookup performed)
  ```

# Usage

## Install

```sh
npm install --save @kv-orm/core
```

## Datastores

### `MemoryDatastore`

`MemoryDatastore` is inbuilt into `@kv-orm/core`. It is a simple in-memory key-value datastore, and can be used for prototyping applications.

```typescript
import { MemoryDatastore } from `@kv-orm/core`

const libraryDatastore = new MemoryDatastore()
```

### Cloudflare Workers KV

See [`@kv-orm/cf-workers`](https://github.com/kv-orm/cf-workers) for more information.

## Entities

An Entity is an object which stores data about something e.g. an Author. The Entity decorator takes a datastore to save the Entity instances into.

Optionally, you can also pass in a `key` to the decorator, to rename the value in the datastore.

You can initialize a new instance of the Entity as normal.

```typescript
import { Entity } from '@kv-orm/core'

@Entity({ datastore: libraryDatastore, key: 'Author' })
class Author {
  // ...
}

const authorInstance = new Author()
```

## Columns

Using the `@Column()` decorator on an Entity property is how you mark it as a savable property. You must `await` their value. This is because it might need to query the datastore, if it doesn't have the value in memory.

Like with Entities, you can optionally pass in a `key` to the decorator.

```typescript
import { Column } from '@kv-orm/core'

@Entity({ datastore: libraryDatastore })
class Author {
  @Column({ key: 'givenName' })
  public firstName: string

  @Column()
  public lastName: string

  @Column()
  public nickName: string | undefined

  @Column({ isPrimary: true })  // More on this in a moment
  public emailAddress: string

  public someUnsavedProperty: any

  public constructor(firstName: string, lastName: string, emailAddress: string) {
    this.firstName = firstName
    this.lastName = lastName
    this.emailAddress = emailAddress
  }
}

const williamShakespeare = new Author(
  'William',
  'Shakespeare',
  'william@shakespeare.com'
)
williamShakespeare.nickName = 'Bill'
williamShakespeare.someUnsavedProperty = "Won't get saved!"

// When in an async function, you can fetch the value with `await`
async function foo() => {
  console.log(await author.firstName)
}

// Or, use `Promise.then()`...
author.lastName.then(lastName => {
  console.log(lastName)
})
```

### Primary Columns

Any non-singleton class needs a Primary Column used to differentiate Entity instances. For this reason, **Primary Column values are required and must be unique**. Simply pass in `{ isPrimary: true }` into the `@Column()` decorator.

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @Column({ isPrimary: true })
  public emailAddress: string

  // ...
}
```

An example of a singleton class where you do not need a Primary Column, might be a configuration Entity where you store application secrets (e.g. API keys).

### Indexable Columns

Similarly, an Column can be set as Indexable with `{ isIndexable: true }`. And like with Primary Columns, **Indexable Column values should be unique**.

> These will be searchable very shortly.

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @Column({ isIndexable: true })
  public phoneNumber: string | undefined

  // ...
}
```

### Property Getters/Setters

If your property is particularly complex (i.e. can't be stored natively in the datastore), you may wish to use a property getter/setter for a Column, to allow you to serialize it before saving in the datastore.

For example, let's say you have a complex property, `Author.somethingComplex`:

```typescript
@Entity({ datastore: libraryDatastore })
class Author {
  // ...

  @Column()
  private _complex: string // place to store serialized value of somethingComplex

  set somethingComplex(value: any) {
    this._complex = serialize(value) // function serialize(value: any): string
  }
  async get somethingComplex(): any {
    return deserialize(await this._complex) // function deserialize(serializedValue: string): any
  }

  // ...
}
```

## Repositories

To actually interact with the datastore, you'll need a Repository.

```typescript
import { getRepository } from '@kv-orm/core'

const authorRepository = getRepository(Author)
```

### Save

You can then save Entity instances.

```typescript
const williamShakespeare = new Author(
  'William',
  'Shakespeare',
  'william@shakespeare.com'
)
await authorRepository.save(williamShakepseare)
```

### Load

And subsequently, load them back again. If the Entity has a Primary Column, you can load the specific instance by passing in the Primary Column value.

```typescript
const loadedWilliamShakespeare = await authorRepository.load(
  'william@shakespeare.com'
)
console.log(await loadedWilliamShakespeare.nickName) // Bill
```

# Development

## Clone and Install Dependencies

```sh
git clone git@github.com:kv-orm/core.git
npm install
```

## Run tests

```sh
npm run lint  # 'npm run format' will automatically fix most problems
npm test
```

## 🚎 Roadmap

<a href="https://github.com/kv-orm/core/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement" target="_blank">
  <img alt="Features" src="https://img.shields.io/github/issues/kv-orm/core/enhancement?color=%2335a501&label=Features&logo=github&style=plastic" />
</a>

- Searching Indexable Columns
- Relationships
- Improved performance

<a href="https://github.com/kv-orm/core/issues?q=is%3Aopen+is%3Aissue+label%3Abug" target="_blank">
  <img alt="Bugs" src="https://img.shields.io/github/issues/kv-orm/core/bug?color=%23d73a4a&label=Bugs&logo=github&style=plastic" />
</a>

## 📝 License

Copyright © 2019 [Greg Brimble](https://github.com/GregBrimble).<br />
This project is [MIT](https://github.com/kv-orm/core/blob/master/LICENSE) licensed.

# FAQs

### My Entity keys are getting mangled when they are saved into the datastore!

If you're using a preprocessor that minifies class names, such as Babel, the class constructors names often get shortened. kv-orm will always use this class name, so, either disable minification in the preprocessor, or manually set the `key` value when creating an Entity e.g.

```typescript
@Entity({ key: 'MyClass' })
class MyClass {
  // ...
}
```

[kv-orm]: https://github.com/kv-orm/core
