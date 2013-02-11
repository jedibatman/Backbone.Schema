[lnk]: https://travis-ci.org/DreamTheater/Backbone.Schema
[img]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png

# Backbone.Schema [![Build Status][img]][lnk]
The plugin is for defining model's properties with type specifying.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 0.9.10`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.4.4`
  - [Globalize](https://github.com/jquery/globalize) `>= 0.1.1`

## Getting Started
### Create model
```js
var model = new Backbone.Model();
```

### Define properties
#### model.property(attribute, type)
##### Type `string`
Converts value to string. Represents as is.

```js
model.property('stringProperty', 'string');

model.set('stringProperty', 999999.99); // model.attributes.stringProperty -> "999999.99"
model.get('stringProperty'); // "999999.99"
```

##### Type `number`
Converts value to number. Represents as string in current [culture](https://github.com/jquery/globalize#culture)'s format.

```js
model.property('numberProperty', 'number');

model.set('numberProperty', '999,999.99'); // model.attributes.numberProperty -> 999999.99
model.get('numberProperty'); // "999,999.99"
```

##### Type `boolean`
Converts value to boolean. Represents as is.

```js
model.property('booleanProperty', 'boolean');

model.set('booleanProperty', 'true'); // model.attributes.booleanProperty -> true
model.get('booleanProperty'); // true
```

##### Type `date`
Converts value to Unix time. Represents as string in current [culture](https://github.com/jquery/globalize#culture)'s format.

```js
model.property('dateProperty', 'date');

model.set('dateProperty', '12/31/2012'); // model.attributes.dateProperty -> 1356904800000
model.get('dateProperty'); // "12/31/2012"
```

##### Type `text`
Converts value to string and escapes unsafe characters. Before representation brings back original characters.

```js
model.property('textProperty', 'text');

model.set('textProperty', '<b>text</b>'); // model.attributes.textProperty -> "&lt;b&gt;text&lt;&#x2F;b&gt;"
model.get('textProperty'); // "<b>text</b>"
```

##### Type `currency`
Converts value to number. Represents as string in current [culture](https://github.com/jquery/globalize#culture)'s format.

```js
model.property('currencyProperty', 'currency');

model.set('currencyProperty', '$999,999.99'); // model.attributes.currencyProperty -> 999999.99
model.get('currencyProperty'); // "$999,999.99"
```

##### Type `percent`
Converts value to hundredths of number. Represents as string in current [culture](https://github.com/jquery/globalize#culture)'s format.

```js
model.property('percentProperty', 'percent');

model.set('percentProperty', '99.99 %'); // model.attributes.percentProperty -> 0.9999
model.get('percentProperty'); // "99.99 %"
```

#### model.toJSON([options])
Without options works as original Backbone's `toJSON` method. With `{ schema: true }` option returns formatted representation.

```js
model.toJSON();
// {
//     "stringProperty": "string",
//     "numberProperty": 999999.99,
//     "booleanProperty": true,
//     "dateProperty": 1356904800000,
//     "textProperty": "&lt;b&gt;text&lt;&#x2F;b&gt;",
//     "currencyProperty": 999999.99,
//     "percentProperty": 0.9999
// }

model.toJSON({ schema: true });
// {
//     "stringProperty": "string",
//     "numberProperty": "999,999.99",
//     "booleanProperty": true,
//     "dateProperty": "12/31/2012",
//     "textProperty": "<b>text</b>",
//     "currencyProperty": "$999,999.99",
//     "percentProperty": "99.99 %"
// }
```

#### model.computed(attribute, options)
```js
// Create model
var user = new Backbone.Model({
    firstName: 'Dmytro',
    lastName: 'Nemoga'
});

// Define computed property
user.computed('fullName', {
    getter: function (attribute, value) {
        var firstName = this.get('firstName'),
            lastName = this.get('lastName');

        return firstName + ' ' + lastName;
    },

    setter: function (attribute, value) {
        var match = value.match(/(\S+)\s(\S+)/);

        return {
            firstName: match[1],
            lastName: match[2]
        };
    }
});

// Get computed property
user.get('fullName'); // "Dmytro Nemoga"

// Set computed property
user.set('fullName', 'Andriy Serputko'); // user.attributes -> { firstName: "Andriy", lastName: "Serputko" }
```

#### Keeping integrity
Plugin prevents setting `undefined` values, instead of this it assigns default value or `null`.

## Changelog
### 0.1.6
  - Integration with [Backbone.Accessors](https://github.com/DreamTheater/Backbone.Accessors)
  - Method `defineProperty` renamed to `property`
  - Methods `addGetter`/`addSetter` merged to method `computed`
  - Option `advanced` of `toJSON` method renamed to `schema`

### 0.1.2
  - Removed argument `options` of `defineProperty` method's

### 0.1.1
  - Method `addProperty` renamed to `defineProperty`

### 0.1.0
  - Initial release
