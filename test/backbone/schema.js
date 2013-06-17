/*jshint maxstatements:37 */
$(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Model = Backbone.Model.extend({
            defaults: {
                'string-property': 'default',
                'number-property': 0,
                'boolean-property': false,
                'datetime-property': new Date('12/12/2012').toISOString(),
                'text-property': 'default',
                'locale-property': 'default'
            },

            initialize: function () {
                this.schema = new Backbone.Schema(this).define({
                    'string-property': { type: 'string' },
                    'number-property': { type: 'number' },
                    'boolean-property': { type: 'boolean' },
                    'datetime-property': { type: 'datetime' },
                    'text-property': { type: 'text' },
                    'locale-property': { type: 'locale' },

                    'array-of-strings': { arrayOf: 'string' },
                    'array-of-numbers': { arrayOf: 'number' },
                    'array-of-booleans': { arrayOf: 'boolean' },
                    'array-of-datetimes': { arrayOf: 'datetime' },
                    'array-of-texts': { arrayOf: 'text' },
                    'array-of-locales': { arrayOf: 'locale' },

                    'nested-model': { model: Backbone.Model },
                    'nested-collection': { collection: Backbone.Collection },

                    'reference-model': {
                        model: Backbone.Model,
                        fromSource: sourceCollection
                    },

                    'reference-collection': {
                        collection: Backbone.Collection,
                        fromSource: sourceCollection
                    }
                });
            }
        }),

        sourceCollection = new Backbone.Collection([
            { id: 0, value: 'foo' },
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

    Globalize.addCultureInfo('en', {
        messages: {
            'HELLO_WORLD': 'Hello, World!'
        }
    });

    ////////////
    // MODULE //
    ////////////

    module('Backbone.Model (Schema)', {
        setup: function () {
            this.model = new Model({
                'string-property': 'string',
                'number-property': 999999.99,
                'boolean-property': true,
                'datetime-property': new Date('12/12/2012').toISOString(),
                'text-property': '&lt;b&gt;text&lt;&#x2F;b&gt;',
                'locale-property': 'HELLO_WORLD',

                'array-of-strings': ['string'],
                'array-of-numbers': [999999.99],
                'array-of-booleans': [true],
                'array-of-datetimes': [new Date('12/12/2012').toISOString()],
                'array-of-texts': ['&lt;b&gt;text&lt;&#x2F;b&gt;'],
                'array-of-locales': ['HELLO_WORLD'],

                'nested-model': { id: 0, value: 'foo' },
                'nested-collection': [
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ],

                'reference-model': 0,
                'reference-collection': [1, 2, 3]
            });
        }
    });

    ///////////
    // TESTS //
    ///////////

    test('initial values', function () {
        var attributes = this.model.attributes;

        strictEqual(attributes['string-property'], 'string');
        strictEqual(attributes['number-property'], 999999.99);
        strictEqual(attributes['boolean-property'], true);
        strictEqual(attributes['datetime-property'], new Date('12/12/2012').toISOString());
        strictEqual(attributes['text-property'], '&lt;b&gt;text&lt;&#x2F;b&gt;');
        strictEqual(attributes['locale-property'], 'HELLO_WORLD');

        deepEqual(attributes['array-of-strings'], ['string']);
        deepEqual(attributes['array-of-numbers'], [999999.99]);
        deepEqual(attributes['array-of-booleans'], [true]);
        deepEqual(attributes['array-of-datetimes'], [new Date('12/12/2012').toISOString()]);
        deepEqual(attributes['array-of-texts'], ['&lt;b&gt;text&lt;&#x2F;b&gt;']);
        deepEqual(attributes['array-of-locales'], ['HELLO_WORLD']);

        ok(attributes['nested-model'] instanceof Backbone.Model);
        ok(attributes['nested-collection'] instanceof Backbone.Collection);

        ok(attributes['reference-model'] instanceof Backbone.Model);
        ok(attributes['reference-collection'] instanceof Backbone.Collection);
    });

    test('get string property', function () {
        var stringProperty = this.model.get('string-property');

        strictEqual(stringProperty, 'string');
    });

    test('get number property', function () {
        var numberProperty = this.model.get('number-property');

        strictEqual(numberProperty, '999,999.99');
    });

    test('get boolean property', function () {
        var booleanProperty = this.model.get('boolean-property');

        strictEqual(booleanProperty, true);
    });

    test('get datetime property', function () {
        var datetimeProperty = this.model.get('datetime-property');

        strictEqual(datetimeProperty, '12/12/2012');
    });

    test('get text property', function () {
        var textProperty = this.model.get('text-property');

        strictEqual(textProperty, '<b>text</b>');
    });

    test('get locale property', function () {
        var localeProperty = this.model.get('locale-property');

        strictEqual(localeProperty, 'Hello, World!');
    });

    test('get array of strings', function () {
        var arrayOfStrings = this.model.get('array-of-strings');

        deepEqual(arrayOfStrings, ['string']);
    });

    test('get array of numbers', function () {
        var arrayOfNumbers = this.model.get('array-of-numbers');

        deepEqual(arrayOfNumbers, ['999,999.99']);
    });

    test('get array of booleans', function () {
        var arrayOfBooleans = this.model.get('array-of-booleans');

        deepEqual(arrayOfBooleans, [true]);
    });

    test('get array of datetimes', function () {
        var arrayOfDatetimes = this.model.get('array-of-datetimes');

        deepEqual(arrayOfDatetimes, ['12/12/2012']);
    });

    test('get array of texts', function () {
        var arrayOfTexts = this.model.get('array-of-texts');

        deepEqual(arrayOfTexts, ['<b>text</b>']);
    });

    test('get array of locales', function () {
        var arrayOfLocales = this.model.get('array-of-locales');

        deepEqual(arrayOfLocales, ['Hello, World!']);
    });

    test('set and unset string property', function () {
        var model = this.model, attributes = model.attributes;

        model.set('string-property', 'string');
        strictEqual(attributes['string-property'], 'string');

        model.set('string-property', 999999.99);
        strictEqual(attributes['string-property'], '999999.99');

        model.set('string-property', true);
        strictEqual(attributes['string-property'], 'true');

        model.set('string-property', {});
        strictEqual(attributes['string-property'], '[object Object]');

        model.set('string-property', null);
        strictEqual(attributes['string-property'], null);

        model.set('string-property', undefined);
        strictEqual(attributes['string-property'], 'default');

        model.unset('string-property');
        strictEqual(attributes['string-property'], undefined);
    });

    test('set and unset number property', function () {
        var model = this.model, attributes = model.attributes;

        model.set('number-property', '999,999.99');
        strictEqual(attributes['number-property'], 999999.99);

        model.set('number-property', 999999.99);
        strictEqual(attributes['number-property'], 999999.99);

        model.set('number-property', true);
        ok(isNaN(attributes['number-property']));

        model.set('number-property', {});
        ok(isNaN(attributes['number-property']));

        model.set('number-property', null);
        strictEqual(attributes['number-property'], null);

        model.set('number-property', undefined);
        strictEqual(attributes['number-property'], 0);

        model.unset('number-property');
        strictEqual(attributes['number-property'], undefined);
    });

    test('set and unset boolean property', function () {
        var model = this.model, attributes = model.attributes;

        model.set('boolean-property', 'true');
        strictEqual(attributes['boolean-property'], true);

        model.set('boolean-property', 999999.99);
        strictEqual(attributes['boolean-property'], true);

        model.set('boolean-property', true);
        strictEqual(attributes['boolean-property'], true);

        model.set('boolean-property', {});
        strictEqual(attributes['boolean-property'], true);

        model.set('boolean-property', null);
        strictEqual(attributes['boolean-property'], null);

        model.set('boolean-property', undefined);
        strictEqual(attributes['boolean-property'], false);

        model.unset('boolean-property');
        strictEqual(attributes['boolean-property'], undefined);
    });

    test('set and unset datetime property', function () {
        var model = this.model, attributes = model.attributes;

        model.set('datetime-property', '12/12/2012');
        strictEqual(attributes['datetime-property'], new Date('12/12/2012').toISOString());

        model.set('datetime-property', 999999.99);
        strictEqual(attributes['datetime-property'], new Date(999999).toISOString());

        model.set('datetime-property', true);
        strictEqual(attributes['datetime-property'], new Date(1).toISOString());

        model.set('datetime-property', {});
        strictEqual(attributes['datetime-property'], 'Invalid Date');

        model.set('datetime-property', null);
        strictEqual(attributes['datetime-property'], null);

        model.set('datetime-property', undefined);
        strictEqual(attributes['datetime-property'], new Date('12/12/2012').toISOString());

        model.unset('datetime-property');
        strictEqual(attributes['datetime-property'], undefined);
    });

    test('set and unset text property', function () {
        var model = this.model, attributes = model.attributes;

        model.set('text-property', '<b>text</b>');
        strictEqual(attributes['text-property'], '&lt;b&gt;text&lt;&#x2F;b&gt;');

        model.set('text-property', 999999.99);
        strictEqual(attributes['text-property'], '999999.99');

        model.set('text-property', true);
        strictEqual(attributes['text-property'], 'true');

        model.set('text-property', {});
        strictEqual(attributes['text-property'], '[object Object]');

        model.set('text-property', null);
        strictEqual(attributes['text-property'], null);

        model.set('text-property', undefined);
        strictEqual(attributes['text-property'], 'default');

        model.unset('text-property');
        strictEqual(attributes['text-property'], undefined);
    });

    test('set and unset locale property', function () {
        var model = this.model, attributes = model.attributes;

        model.set('locale-property', 'Hello, World!');
        strictEqual(attributes['locale-property'], 'HELLO_WORLD');

        model.set('locale-property', 999999.99);
        strictEqual(attributes['locale-property'], '999999.99');

        model.set('locale-property', true);
        strictEqual(attributes['locale-property'], 'true');

        model.set('locale-property', {});
        strictEqual(attributes['locale-property'], '[object Object]');

        model.set('locale-property', null);
        strictEqual(attributes['locale-property'], null);

        model.set('locale-property', undefined);
        strictEqual(attributes['locale-property'], 'default');

        model.unset('locale-property');
        strictEqual(attributes['locale-property'], undefined);
    });

    test('set and unset array of strings', function () {
        var model = this.model, attributes = model.attributes;

        model.set('array-of-strings', ['string']);
        deepEqual(attributes['array-of-strings'], ['string']);

        model.set('array-of-strings', [999999.99]);
        deepEqual(attributes['array-of-strings'], ['999999.99']);

        model.set('array-of-strings', [true]);
        deepEqual(attributes['array-of-strings'], ['true']);

        model.set('array-of-strings', [{}]);
        deepEqual(attributes['array-of-strings'], ['[object Object]']);

        model.set('array-of-strings', [null]);
        deepEqual(attributes['array-of-strings'], []);

        model.set('array-of-strings', [undefined]);
        deepEqual(attributes['array-of-strings'], []);

        model.unset('array-of-strings');
        deepEqual(attributes['array-of-strings'], undefined);
    });

    test('set and unset array of numbers', function () {
        var model = this.model, attributes = model.attributes;

        model.set('array-of-numbers', ['999,999.99']);
        deepEqual(attributes['array-of-numbers'], [999999.99]);

        model.set('array-of-numbers', [999999.99]);
        deepEqual(attributes['array-of-numbers'], [999999.99]);

        model.set('array-of-numbers', [true]);
        ok(isNaN(attributes['array-of-numbers']));

        model.set('array-of-numbers', [{}]);
        ok(isNaN(attributes['array-of-numbers']));

        model.set('array-of-numbers', [null]);
        deepEqual(attributes['array-of-numbers'], []);

        model.set('array-of-numbers', [undefined]);
        deepEqual(attributes['array-of-numbers'], []);

        model.unset('array-of-numbers');
        deepEqual(attributes['array-of-numbers'], undefined);
    });

    test('set and unset array of booleans', function () {
        var model = this.model, attributes = model.attributes;

        model.set('array-of-booleans', ['true']);
        deepEqual(attributes['array-of-booleans'], [true]);

        model.set('array-of-booleans', [999999.99]);
        deepEqual(attributes['array-of-booleans'], [true]);

        model.set('array-of-booleans', [true]);
        deepEqual(attributes['array-of-booleans'], [true]);

        model.set('array-of-booleans', [{}]);
        deepEqual(attributes['array-of-booleans'], [true]);

        model.set('array-of-booleans', [null]);
        deepEqual(attributes['array-of-booleans'], []);

        model.set('array-of-booleans', [undefined]);
        deepEqual(attributes['array-of-booleans'], []);

        model.unset('array-of-booleans');
        deepEqual(attributes['array-of-booleans'], undefined);
    });

    test('set and unset array of datetimes', function () {
        var model = this.model, attributes = model.attributes;

        model.set('array-of-datetimes', ['12/12/2012']);
        deepEqual(attributes['array-of-datetimes'], [new Date('12/12/2012').toISOString()]);

        model.set('array-of-datetimes', [999999.99]);
        deepEqual(attributes['array-of-datetimes'], [new Date(999999).toISOString()]);

        model.set('array-of-datetimes', [true]);
        deepEqual(attributes['array-of-datetimes'], [new Date(1).toISOString()]);

        model.set('array-of-datetimes', [{}]);
        deepEqual(attributes['array-of-datetimes'], ['Invalid Date']);

        model.set('array-of-datetimes', [null]);
        deepEqual(attributes['array-of-datetimes'], []);

        model.set('array-of-datetimes', [undefined]);
        deepEqual(attributes['array-of-datetimes'], []);

        model.unset('array-of-datetimes');
        deepEqual(attributes['array-of-datetimes'], undefined);
    });

    test('set and unset array of texts', function () {
        var model = this.model, attributes = model.attributes;

        model.set('array-of-texts', ['<b>text</b>']);
        deepEqual(attributes['array-of-texts'], ['&lt;b&gt;text&lt;&#x2F;b&gt;']);

        model.set('array-of-texts', [999999.99]);
        deepEqual(attributes['array-of-texts'], ['999999.99']);

        model.set('array-of-texts', [true]);
        deepEqual(attributes['array-of-texts'], ['true']);

        model.set('array-of-texts', [{}]);
        deepEqual(attributes['array-of-texts'], ['[object Object]']);

        model.set('array-of-texts', [null]);
        deepEqual(attributes['array-of-texts'], []);

        model.set('array-of-texts', [undefined]);
        deepEqual(attributes['array-of-texts'], []);

        model.unset('array-of-texts');
        deepEqual(attributes['array-of-texts'], undefined);
    });

    test('set and unset array of locales', function () {
        var model = this.model, attributes = model.attributes;

        model.set('array-of-locales', ['Hello, World!']);
        deepEqual(attributes['array-of-locales'], ['HELLO_WORLD']);

        model.set('array-of-locales', [999999.99]);
        deepEqual(attributes['array-of-locales'], ['999999.99']);

        model.set('array-of-locales', [true]);
        deepEqual(attributes['array-of-locales'], ['true']);

        model.set('array-of-locales', [{}]);
        deepEqual(attributes['array-of-locales'], ['[object Object]']);

        model.set('array-of-locales', [null]);
        deepEqual(attributes['array-of-locales'], []);

        model.set('array-of-locales', [undefined]);
        deepEqual(attributes['array-of-locales'], []);

        model.unset('array-of-locales');
        deepEqual(attributes['array-of-locales'], undefined);
    });

    test('get nested model', function () {
        var nestedModel = this.model.get('nested-model'),
            attributes = nestedModel.attributes;

        deepEqual(attributes, { id: 0, value: 'foo' });
    });

    test('get nested collection', function () {
        var nestedCollection = this.model.get('nested-collection'),
            attributes = _.pluck(nestedCollection.models, 'attributes');

        deepEqual(attributes, [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);
    });

    test('get reference model', function () {
        var referenceModel = this.model.get('reference-model'),
            attributes = referenceModel.attributes;

        deepEqual(attributes, { id: 0, value: 'foo' });
    });

    test('get reference collection', function () {
        var referenceCollection = this.model.get('reference-collection'),
            attributes = _.pluck(referenceCollection.models, 'attributes');

        deepEqual(attributes, [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);
    });

    test('set and unset nested model', function () {
        var model = this.model, nestedModel = model.get('nested-model'),
            attributes = nestedModel.attributes;

        model.set('nested-model', { id: 0, value: 'foo' });
        deepEqual(attributes, { id: 0, value: 'foo' });

        model.set('nested-model', {});
        deepEqual(attributes, {});

        model.set('nested-model', null);
        deepEqual(attributes, {});

        model.set('nested-model', undefined);
        deepEqual(attributes, {});

        model.unset('nested-model');
        strictEqual(model.attributes['nested-model'], undefined);
    });

    test('set and unset nested collection', function () {
        var model = this.model, nestedCollection = model.get('nested-collection');

        model.set('nested-collection', [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        deepEqual(_.pluck(nestedCollection.models, 'attributes'), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        model.set('nested-collection', []);
        deepEqual(_.pluck(nestedCollection.models, 'attributes'), []);

        model.set('nested-collection', null);
        deepEqual(_.pluck(nestedCollection.models, 'attributes'), []);

        model.set('nested-collection', undefined);
        deepEqual(_.pluck(nestedCollection.models, 'attributes'), []);

        model.unset('nested-collection');
        strictEqual(model.attributes['nested-collection'], undefined);
    });

    test('set and unset reference model', function () {
        var model = this.model, referenceModel = model.get('reference-model'),
            attributes = referenceModel.attributes;

        model.set('reference-model', 0);
        deepEqual(attributes, { id: 0, value: 'foo' });

        model.set('reference-model', {});
        deepEqual(attributes, {});

        model.set('reference-model', null);
        deepEqual(attributes, {});

        model.set('reference-model', undefined);
        deepEqual(attributes, {});

        model.unset('reference-model');
        strictEqual(model.attributes['reference-model'], undefined);
    });

    test('set and unset reference collection', function () {
        var model = this.model, referenceCollection = model.get('reference-collection');

        model.set('reference-collection', [1, 2, 3]);
        deepEqual(_.pluck(referenceCollection.models, 'attributes'), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        model.set('reference-collection', []);
        deepEqual(_.pluck(referenceCollection.models, 'attributes'), []);

        model.set('reference-collection', null);
        deepEqual(_.pluck(referenceCollection.models, 'attributes'), []);

        model.set('reference-collection', undefined);
        deepEqual(_.pluck(referenceCollection.models, 'attributes'), []);

        model.unset('reference-collection');
        strictEqual(model.attributes['reference-collection'], undefined);
    });

    test('toJSON', function () {
        var json = this.model.toJSON();

        deepEqual(json, {
            'string-property': 'string',
            'number-property': 999999.99,
            'boolean-property': true,
            'datetime-property': new Date('12/12/2012').toISOString(),
            'text-property': '&lt;b&gt;text&lt;&#x2F;b&gt;',
            'locale-property': 'HELLO_WORLD',

            'array-of-strings': ['string'],
            'array-of-numbers': [999999.99],
            'array-of-booleans': [true],
            'array-of-datetimes': [new Date('12/12/2012').toISOString()],
            'array-of-texts': ['&lt;b&gt;text&lt;&#x2F;b&gt;'],
            'array-of-locales': ['HELLO_WORLD'],

            'nested-model': { id: 0, value: 'foo' },
            'nested-collection': [
                { id: 1, value: 'bar' },
                { id: 2, value: 'baz' },
                { id: 3, value: 'qux' }
            ],

            'reference-model': 0,
            'reference-collection': [1, 2, 3]
        });
    });
});
