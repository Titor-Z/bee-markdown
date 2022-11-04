<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/atom.css">

- Hello [hello]
- Test [test]

## Useage

```Typescript
const databaseOption = {
  database: jsonFile
}

const db = new BeeDatabase();

db.table('user').insert({
  name: 'mike',
  age: 20,
  sex: 1
})
db.table('user').select(where)
db.table('user').find(where)
db.table('user').update(where)
db.table('user').delete(where)
```

<hr>

```Typescript
class User extend BeeDatabase {
  constructior(){
    super();
    this.table = 'user'
  }

  insert() {

  }
}
```

<hr>

[hello]: docs/hello.md
[test]: docs/test.md
