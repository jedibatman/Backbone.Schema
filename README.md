[npm-badge]: https://badge.fury.io/js/backbone.schema.png
[npm-link]: https://badge.fury.io/js/backbone.schema

[travis-badge]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png
[travis-link]: https://travis-ci.org/DreamTheater/Backbone.Schema

# Backbone.Schema [![NPM Version][npm-badge]][npm-link] [![Build Status][travis-badge]][travis-link]
The plugin help you to define a schema of model. It supports simple types, arrays, nested or reference models/collections, allow to define custom data types and computable properties.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 1.0.0`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.4.4`
  - [Globalize](https://github.com/jquery/globalize) `>= 0.1.1`

## Getting Started
### Create model and schema
Backbone.Schema is a decorator. Just pass model instance into constructor of class to start using it.
```js
var model = new Backbone.Model(), schema = new Backbone.Schema(model);
```

### Define properties
Use `schema.define(attribute, options)` method to define properties of your model. If you want to define a lot of properties in one action use `schema.define(attributes)` option.

#### Option `type`
##### Type `string`
Converts value to string. Represents as is.
```js
schema.define('string-property', { type: 'string' });

model.set('string-property', 999999.99); // --> "999999.99"
model.get('string-property'); // <-- "999999.99"
```

##### Type `boolean`
Converts value to boolean. Represents as is.
```js
schema.define('boolean-property', { type: 'boolean' });

model.set('boolean-property', 'true'); // --> true
model.get('boolean-property'); // <-- true
```

##### Type `number`
Converts value to number. Represents as string. Supports special options `format` (by default equal to `'n'`) ([see more](https://github.com/jquery/globalize#numbers)) and `culture` (by default equal to [current culture](https://github.com/jquery/globalize#culture)).
```js
schema.define('number-property', { type: 'number', format: 'n2' });

model.set('number-property', '999,999.99'); // --> 999999.99
model.get('number-property'); // <-- "999,999.99"
```

##### Type `datetime`
Converts value to [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) or [Unix time](http://en.wikipedia.org/wiki/Unix_time). Represents as string. Supports special options `format` (by default equal to `'d'`) ([see more](https://github.com/jquery/globalize#dates)), `culture` (by default equal to [current culture](https://github.com/jquery/globalize#culture)) and `standard` (by default equal to `'iso'`, available variants are `iso` and `unix`).
```js
schema.define('datetime-property', { type: 'datetime', standard: 'unix' });

model.set('datetime-property', '12/12/2012'); // --> 1355263200000
model.get('datetime-property'); // <-- "12/12/2012"
```

##### Type `locale`
Converts value to localization. Represents as localized string. Supports special option `culture` (by default equal to [current culture](https://github.com/jquery/globalize#culture)) ([see more](https://github.com/jquery/globalize#localize)).
```js
Globalize.addCultureInfo('en', {
    messages: {
        'HELLO_WORLD': 'Hello, World!'
    }
});

schema.define('locale-property', { type: 'locale', culture: 'en' });

model.set('locale-property', 'Hello, World!'); // --> "HELLO_WORLD"
model.get('locale-property'); // <-- "Hello, World!"
```

##### Type `text`
Converts value to string, escaping an unsafe HTML characters. Represents unescaped string.
```js
schema.define('text-property', { type: 'text' });

model.set('text-property', '<b>text</b>'); // --> "&lt;b&gt;text&lt;&#x2F;b&gt;"
model.get('text-property'); // <-- "<b>text</b>"
```

### Define properties of array type
#### Option `array`
Besides listed above data types you can define arrays. To do this just use option `array` instead of `type`. For example: `{ array: 'string' }`, `{ array: 'number' }` etc. In this case each item in array would be processed by corresponding handler.

### Define computed property
You can define a computed properties with your own custom logic.

#### Options `getter` and `setter`
Manipulate these two options to describe behavior of the computed property.
```js
var User = Backbone.Model.extend({
   initialize: function () {
       var schema = new Backbone.Schema(this);

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
});
```
```js
var user = new User({
    firstName: 'Dmytro',
    lastName: 'Nemoga'
});

user.get('fullName'); // <-- "Dmytro Nemoga"
user.set('fullName', 'Andriy Serputko'); // --> firstName: "Andriy", lastName: "Serputko"
```

If you do not like to use an automatic conversion you can override predefined `getter` and `setter` to prevent standard processing.
```js
// Disable getter to prevent number formatting
schema.define('number-property', { type: 'number', getter: false });

model.set('number-property', '999,999.99'); // --> 999999.99
model.get('number-property'); // <-- 999999.99
```

### Define nested models and collections
#### Option `model`
Converts value to model, using value as attributes. Represents as is.
```js
schema.define('nested-model', { model: Backbone.Model });

model.set('nested-model', { id: 0, value: 'foo' }); // --> new Backbone.Model({ id: 0, value: 'foo' })
model.get('nested-model'); // <-- instance of Backbone.Model
```

#### Option `collection`
Converts value to collection, using value as array of attributes. Represents as is.
```js
schema.define('nested-collection', { collection: Backbone.Collection });

model.set('nested-collection', [ // --> new Backbone.Collection([
    { id: 1, value: 'bar' },     //         { id: 1, value: 'bar' },
    { id: 2, value: 'baz' },     //         { id: 2, value: 'baz' },
    { id: 3, value: 'qux' }      //         { id: 3, value: 'qux' }
]);                              //     ])

model.get('nested-collection'); // <-- instance of Backbone.Collection
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

#### Options `model` and `source`
Converts value (a model ID in the source collection) to model, keeping reference to original model. Represents as is.
```js
schema.define('reference-model', { model: Backbone.Model, source: sourceCollection });

model.set('reference-model', 0); // --> sourceCollection.get(0)
model.get('reference-model'); // <-- instance of Backbone.Model
```

#### Options `collection` and `source`
Converts value (array of a model IDs in the source collection) to collection, keeping references to original models. Represents as is.
```js
schema.define('reference-collection', { collection: Backbone.Collection, source: sourceCollection });

model.set('reference-collection', [ // --> new Backbone.Collection([
    1,                              //         sourceCollection.get(1),
    2,                              //         sourceCollection.get(2),
    3                               //         sourceCollection.get(3)
]);                                 //     ])

model.get('reference-collection'); // <-- instance of Backbone.Collection
```

### Keeping integrity
The plugin prevents setting `undefined` values, instead of this it assigns a default value or `null` for regular properties, `{}` for models and `[]` for collections and arrays.

## Changelog
### 0.3.6
  - Option `arrayOf` renamed to `array`
  - Option `fromSource` renamed to `source`

### 0.3.4
  - Added option to use a custom culture

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
  - Method `defineProperty` renamed to `property`
  - Methods `addGetter`/`addSetter` merged to method `computed`
  - Option `advanced` of `toJSON` method renamed to `schema`

### 0.1.2
  - Removed argument `options` of `defineProperty` method's

### 0.1.1
  - Method `addProperty` renamed to `defineProperty`

### 0.1.0
  - Initial release
