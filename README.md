[lnk]: https://travis-ci.org/DreamTheater/Backbone.Schema
[img]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png

# Backbone.Schema [![Build Status][img]][lnk]
The plugin is for automatic converting model's attributes to the specific type.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 0.9.10`
  - [Backbone.Accessors](https://github.com/DreamTheater/Backbone.Accessors) `>= 0.1.1`
  - [Globalize](https://github.com/jquery/globalize) `>= 0.1.1`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.4.3`

## Reference API
```js
var schema = new Backbone.Model();
```

### model.addProperty(attribute, type, [options])
#### String type
```js
schema.addProperty('string', 'string');

schema.set('string', 999999.99); // schema.attributes.string = "999999.99"
schema.get('string'); // "999999.99"
```

#### Number type
```js
schema.addProperty('number', 'number');

schema.set('number', '999,999.99'); // schema.attributes.number = 999999.99
schema.get('number'); // "999,999.99"
```

#### Boolean type
```js
schema.addProperty('boolean', 'boolean');

schema.set('boolean', 'true'); // schema.attributes.boolean = true
schema.get('boolean'); // true
```

#### Date type
```js
schema.addProperty('date', 'date');

schema.set('date', '12/31/2012'); // schema.attributes.date = 1356904800000
schema.get('date'); // "12/31/2012"
```

#### Text type
```js
schema.addProperty('text', 'text');

schema.set('text', '<b>text</b>'); // schema.attributes.text = "&lt;b&gt;text&lt;&#x2F;b&gt;"
schema.get('text'); // "<b>text</b>"
```

#### Percent type
```js
schema.addProperty('percent', 'percent');

schema.set('percent', '99.99 %'); // schema.attributes.percent = 99.99
schema.get('percent'); // "99.99 %"
```

#### Currency type
```js
schema.addProperty('currency', 'currency');

schema.set('currency', '$999,999.99'); // schema.attributes.currency = 999999.99
schema.get('currency'); // "$999,999.99"
```

### model.toJSON([options])
```js
schema.toJSON();                // {
                                //     "string": "string",
                                //     "number": 999999.99,
                                //     "boolean": true,
                                //     "date": 1356904800000,
                                //     "text": "&lt;b&gt;text&lt;&#x2F;b&gt;",
                                //     "percent": 99.99,
                                //     "currency": 999999.99
                                // }

schema.toJSON({ parse: true }); // {
                                //     "string": "string",
                                //     "number": "999,999.99",
                                //     "boolean": true,
                                //     "date": "12/31/2012",
                                //     "text": "<b>text</b>",
                                //     "percent": "99.99 %",
                                //     "currency": "$999,999.99"
                                // }
```

## Changelog
### 0.1.0
  - Initial Release
