[lnk]: https://travis-ci.org/DreamTheater/Backbone.Schema
[img]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png

# Backbone.Schema [![Build Status][img]][lnk]
The plugin is for automatic converting model's attributes to the specific type.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 0.9.10`
  - [Backbone.Accessors](https://github.com/DreamTheater/Backbone.Accessors) `>= 0.1.2`
  - [Globalize](https://github.com/jquery/globalize) `>= 0.1.1`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.4.3`

## Getting Started
### Create model
```js
var model = new Backbone.Model();
```

### Define properties
#### model.defineProperty(attribute, type, [options])
##### String type
```js
model.defineProperty('string', 'string');

model.set('string', 999999.99); // model.attributes.string -> "999999.99"
model.get('string'); // "999999.99"
```

##### Number type
```js
model.defineProperty('number', 'number');

model.set('number', '999,999.99'); // model.attributes.number -> 999999.99
model.get('number'); // "999,999.99"
```

##### Boolean type
```js
model.defineProperty('boolean', 'boolean');

model.set('boolean', 'true'); // model.attributes.boolean -> true
model.get('boolean'); // true
```

##### Date type
```js
model.defineProperty('date', 'date');

model.set('date', '12/31/2012'); // model.attributes.date -> 1356904800000
model.get('date'); // "12/31/2012"
```

##### Text type
```js
model.defineProperty('text', 'text');

model.set('text', '<b>text</b>'); // model.attributes.text -> "&lt;b&gt;text&lt;&#x2F;b&gt;"
model.get('text'); // "<b>text</b>"
```

##### Currency type
```js
model.defineProperty('currency', 'currency');

model.set('currency', '$999,999.99'); // model.attributes.currency -> 999999.99
model.get('currency'); // "$999,999.99"
```

##### Percent type
```js
model.defineProperty('percent', 'percent');

model.set('percent', '99.99 %'); // model.attributes.percent -> 0.9999
model.get('percent'); // "99.99 %"
```

*All formatted values depends from current [culture](https://github.com/jquery/globalize#culture).*

## Changelog
### 0.1.1
  - Renaming method `addProperty` to `defineProperty`

### 0.1.0
  - Initial release
