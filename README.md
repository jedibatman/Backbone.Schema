[npm-badge]: https://badge.fury.io/js/backbone.schema.png
[npm-link]: https://badge.fury.io/js/backbone.schema

[travis-badge]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png
[travis-link]: https://travis-ci.org/DreamTheater/Backbone.Schema

# Backbone.Schema [![NPM Version][npm-badge]][npm-link] [![Build Status][travis-badge]][travis-link]
The plugin is for schema definition. Supports a regular properties, arrays, nested or reference models/collections. Allow to define a custom types and computable properties.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 1.0.0`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.4.4`
  - [Globalize](https://github.com/jquery/globalize) `>= 0.1.1`

## Getting Started
### Create model and schema
```js
var model = new Backbone.Model(), schema = new Backbone.Schema(model);
```

### Define properties
Use `schema.define(attribute, options)` method to define properties of your model.

#### Option `type`
##### Type `string`
Converts value to the string. Represents as is.
```js
schema.define('string-property', { type: 'string' });

model.set('string-property', 999999.99); // model.attributes['string-property'] -> "999999.99"
model.get('string-property'); // "999999.99"
```

##### Type `boolean`
Converts value to the boolean. Represents as is.
```js
schema.define('boolean-property', { type: 'boolean' });

model.set('boolean-property', 'true'); // model.attributes['boolean-property'] -> true
model.get('boolean-property'); // true
```

##### Type `number`
Converts value to the number. Represents as the string in a format of [current culture](https://github.com/jquery/globalize#culture). Supports special option `format` (by default equal to `'n'`) ([see more](https://github.com/jquery/globalize#numbers)).
```js
schema.define('number-property', { type: 'number', format: 'n2' });

model.set('number-property', '999,999.99'); // model.attributes['number-property'] -> 999999.99
model.get('number-property'); // "999,999.99"
```

##### Type `datetime`
Converts value to the [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) or [Unix time](http://en.wikipedia.org/wiki/Unix_time). Represents as the string in a format of [current culture](https://github.com/jquery/globalize#culture). Supports special options `format` (by default equal to `'d'`) ([see more](https://github.com/jquery/globalize#dates)) and `standard` (by default equal to `'iso'`) (available variants are `iso` and `unix`).
```js
schema.define('datetime-property', { type: 'datetime', format: 'd', standard: 'unix' });

model.set('datetime-property', '12/12/2012'); // model.attributes['datetime-property'] -> 1355263200000
model.get('datetime-property'); // "12/12/2012"
```

##### Type `locale`
Converts value to the localization. Represents as the localized string depending on [current culture](https://github.com/jquery/globalize#culture).
```js
Globalize.addCultureInfo('en', {
    messages: {
        'HELLO_WORLD': 'Hello, World!'
    }
});

schema.define('locale-property', { type: 'locale' });

model.set('locale-property', 'Hello, World!'); // model.attributes['locale-property'] -> "HELLO_WORLD"
model.get('locale-property'); // "Hello, World!"
```

##### Type `text`
Converts value to the string, escaping an unsafe HTML characters. Represents an unescaped string.
```js
schema.define('text-property', { type: 'text' });

model.set('text-property', '<b>text</b>'); // model.attributes['text-property'] -> "&lt;b&gt;text&lt;&#x2F;b&gt;"
model.get('text-property'); // "<b>text</b>"
```

### Define properties of array type
#### Option `arrayOf`
Besides listed above property types you can define arrays of these types. To do this just use option `arrayOf` instead of `type`. For example: `{ arrayOf: 'string' }`, `{ arrayOf: 'boolean' }`, `{ arrayOf: 'number' }` etc. In this case each item in array would be processed by corresponding processor.

### Define computed property
You can define a computed properties with your own custom logic.

#### Options `getter` and `setter`
```js
// Create model
var User = Backbone.Model.extend({
        initialize: function () {
            // Initialize schema
            var schema = new Backbone.Schema(this);

            // Define computed property
            schema.define('fullName', {
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
        }
    }),

    // Initialize model
    user = new User({
        firstName: 'Dmytro',
        lastName: 'Nemoga'
    });

// Get computed property
user.get('fullName'); // "Dmytro Nemoga"

// Set computed property
user.set('fullName', 'Andriy Serputko'); // user.attributes -> { firstName: "Andriy", lastName: "Serputko" }
```

#### Options `type`/`arrayOf` and `getter`/`setter`
If you don't want to use an automatic conversion you can override predefined `getter` and `setter` to prevent standard processing.
```js
// Disable getter to prevent number formatting, just return value as is, using standard Backbone's getter
schema.define('number-property', { type: 'number', getter: false });

model.set('number-property', '999,999.99'); // model.attributes['number-property'] -> 999999.99
model.get('number-property'); // 999999.99
```

### Define nested models and collections
#### Option `model`
```js
schema.define('nested-model', { model: Backbone.Model });

model.set('nested-model', { id: 0, value: 'foo' }); // model.attributes['nested-model'] -> instance of Backbone.Model
model.get('nested-model'); // instance of Backbone.Model
```

#### Option `collection`
```js
schema.define('nested-collection', { collection: Backbone.Collection });

model.set('nested-collection', [
    { id: 1, value: 'bar' },
    { id: 2, value: 'baz' },
    { id: 3, value: 'qux' }
]); // model.attributes['nested-collection'] -> instance of Backbone.Collection

model.get('nested-collection'); // instance of Backbone.Collection
```

### Define reference models and collections
Before using reference models or collections make sure that you have a source collection.
```js
var sourceCollection = new Backbone.Collection([
    { id: 0, value: 'foo' },
    { id: 1, value: 'bar' },
    { id: 2, value: 'baz' },
    { id: 3, value: 'qux' }
]);
```

#### Options `model` and `fromSource`
```js
schema.define('reference-model', { model: Backbone.Model, fromSource: sourceCollection });

model.set('reference-model', 0); // model.attributes['reference-model'] -> instance of Backbone.Model
model.get('reference-model'); // instance of Backbone.Model
```

#### Options `collection` and `fromSource`
```js
schema.define('reference-collection', { collection: Backbone.Collection, fromSource: sourceCollection });

model.set('reference-collection', [1, 2, 3]); // model.attributes['reference-collection'] -> instance of Backbone.Collection
model.get('reference-collection'); // instance of Backbone.Collection
```

### Keeping integrity
The plugin prevents setting `undefined` values, instead of this it assigns a default value or `null` for regular properties, `{}` for models and `[]` for collections and arrays.

## Changelog
### 0.3.3
  - Fixed serious issue with `model` type

### 0.3.2
  - Processors `currency` and `percent` merged into `number`

### 0.3.1
  - Plugin implemented as decorator, not a class
  - Option `reset` for `model` and `collection` types

### 0.2.9
  - Properties are configurable with additional options
  - Formatters and converters merged into types
  - Added support of reference models and collections
  - A lot of fixes

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
  - Method `define-property` renamed to `property`
  - Methods `addGetter`/`addSetter` merged to method `computed`
  - Option `advanced` of `toJSON` method renamed to `schema`

### 0.1.2
  - Removed argument `options` of `define-property` method's

### 0.1.1
  - Method `add-property` renamed to `define-property`

### 0.1.0
  - Initial release
