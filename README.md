[npm-badge]: https://badge.fury.io/js/backbone.schema.png
[npm-link]: https://badge.fury.io/js/backbone.schema

[travis-badge]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png
[travis-link]: https://travis-ci.org/DreamTheater/Backbone.Schema

# Backbone.Schema [![NPM Version][npm-badge]][npm-link] [![Build Status][travis-badge]][travis-link]
The plugin is for schema definition. Includes an elementary types, arrays, nested models/collections. Allow to define a custom data types and computable properties.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 1.0.0`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.4.4`
  - [Globalize](https://github.com/jquery/globalize) `>= 0.1.1`

## Reference API
### Backbone.Model
#### Static members
  - Object `formatters`
    - Function `string`
    - Function `number`
    - Function `boolean`
    - Function `date`
    - Function `text`
    - Function `currency`
    - Function `percent`
    - Function `locale`
    - Function `model`
    - Function `collection`
  - Object `converters`
    - Function `string`
    - Function `number`
    - Function `boolean`
    - Function `date`
    - Function `text`
    - Function `currency`
    - Function `percent`
    - Function `locale`
    - Function `model`
    - Function `collection`

#### Instance members
  - Function `property(attribute, type, options)`
    - String `attribute`
    - String `type`
    - Object `options`
      - Backbone.Model `model`
      - Backbone.Collection `collection`
  - Function `computed(attribute, options)`
    - String `attribute`
    - Object `options`
      - Function `getter`
      - Function `setter`

## Getting Started
### Create model
```js
var model = new Backbone.Model();
```

### Define properties
#### Type `string`
Converts value to the string. Represents as is.
```js
model.property('stringProperty', 'string');

model.set('stringProperty', 999999.99); // model.attributes.stringProperty -> "999999.99"
model.get('stringProperty'); // "999999.99"
```

#### Type `number`
Converts value to the number. Represents as the string in a format of [current culture](https://github.com/jquery/globalize#culture).
```js
model.property('numberProperty', 'number');

model.set('numberProperty', '999,999.99'); // model.attributes.numberProperty -> 999999.99
model.get('numberProperty'); // "999,999.99"
```

#### Type `boolean`
Converts value to the boolean. Represents as is.
```js
model.property('booleanProperty', 'boolean');

model.set('booleanProperty', 'true'); // model.attributes.booleanProperty -> true
model.get('booleanProperty'); // true
```

#### Type `date`
Converts value to the [Unix time](http://en.wikipedia.org/wiki/Unix_time). Represents as the string in a format of [current culture](https://github.com/jquery/globalize#culture).
```js
model.property('dateProperty', 'date');

model.set('dateProperty', '12/12/2012'); // model.attributes.dateProperty -> 1355263200000
model.get('dateProperty'); // "12/12/2012"
```

#### Type `text`
Converts value to the string, escaping an unsafe characters. Represents an unescaped string.
```js
model.property('textProperty', 'text');

model.set('textProperty', '<b>text</b>'); // model.attributes.textProperty -> "&lt;b&gt;text&lt;&#x2F;b&gt;"
model.get('textProperty'); // "<b>text</b>"
```

#### Type `currency`
Converts value to the number. Represents as the string in a format of [current culture](https://github.com/jquery/globalize#culture).
```js
model.property('currencyProperty', 'currency');

model.set('currencyProperty', '$999,999.99'); // model.attributes.currencyProperty -> 999999.99
model.get('currencyProperty'); // "$999,999.99"
```

#### Type `percent`
Converts value to the hundredths of number. Represents as the string in a format of [current culture](https://github.com/jquery/globalize#culture).
```js
model.property('percentProperty', 'percent');

model.set('percentProperty', '99.99 %'); // model.attributes.percentProperty -> 0.9999
model.get('percentProperty'); // "99.99 %"
```

#### Type `locale`
Converts value to the localization. Represents as the localized string depending on [current culture](https://github.com/jquery/globalize#culture).
```js
Globalize.addCultureInfo('en', {
    messages: {
        'HELLO_WORLD': 'Hello, World!'
    }
});

model.property('localeProperty', 'locale');

model.set('localeProperty', 'Hello, World!'); // model.attributes.localeProperty -> "HELLO_WORLD"
model.get('localeProperty'); // "Hello, World!"
```

### Define properties of array type
Besides listed above data types you can define arrays of these types. To do this just put brackets in the name of type. For example: `string[]`, `number[]`, `boolean[]` etc. In this case each item in array would be processed with corresponding processor.

### Define nested models and collections
#### Type `model`
```js
model.property('nestedModel', 'model', {
    model: Backbone.Model
});

model.set('nestedModel', { ... }); // model.attributes.nestedModel -> instance of Backbone.Model
model.get('nestedModel'); // instance of Backbone.Model
```

#### Type `collection`
```js
model.property('nestedCollection', 'collection', {
    collection: Backbone.Collection
});

model.set('nestedCollection', [ ... ]); // model.attributes.nestedCollection -> instance of Backbone.Collection
model.get('nestedCollection'); // instance of Backbone.Collection
```

### Define custom data type
Feel free to override existing data types or add new. To do that you should define `formatter` and `converter` functions.
```js
// Define formatter
Backbone.Model.formatters.hex = function (value) {
    return '0x' + value.toString(16).toUpperCase();
};

// Define converter
Backbone.Model.converters.hex = function (value) {
    return parseInt(value, 16);
};
```

#### Custom type `hex`
Converts value to the decimal number. Represents as the hex string.
```js
model.property('hexProperty', 'hex');

model.set('hexProperty', '0xFF'); // model.attributes.hexProperty -> 255
model.get('hexProperty'); // "0xFF"
```

### Define computed property
In addition to custom data types you can define a computed properties.
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
        var fullName = value.split(' ');

        return {
            firstName: fullName[0],
            lastName: fullName[1]
        };
    }
});

// Get computed property
user.get('fullName'); // "Dmytro Nemoga"

// Set computed property
user.set('fullName', 'Andriy Serputko'); // user.attributes -> { firstName: "Andriy", lastName: "Serputko" }
```

### Keeping integrity
The plugin prevents setting `undefined` values, instead of this it assigns a default value or `null`.

## Changelog
### 0.2.5
  - Added support of nested models and collections

### 0.2.4
  - Support of arrays
  - Added type `locale`
  - Removed method `toJSON`

### 0.2.1
  - Formatters and converters takes only `value` argument

### 0.2.0
  - Static methods runs in correct context, now they may be used as independent helpers

### 0.1.9
  - Properties `formatters` and `converters` is static

### 0.1.8
  - Removed CommonJS support

### 0.1.7
  - Added CommonJS support

### 0.1.6
  - Integration with project **Backbone.Accessors**
  - Method `defineProperty` renamed to `property`
  - Methods `addGetter`/`addSetter` merged to method `computed`
  - Option `advanced` of `toJSON` method renamed to `schema`

### 0.1.2
  - Removed argument `options` of `defineProperty` method's

### 0.1.1
  - Method `addProperty` renamed to `defineProperty`

### 0.1.0
  - Initial release
