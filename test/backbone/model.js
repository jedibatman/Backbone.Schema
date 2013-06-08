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
                'datetime-property': new Date('12/12/2012').toString(),
                'text-property': 'default',
                'currency-property': 0,
                'percent-property': 0,
                'locale-property': 'default'
            },

            initialize: function () {
                this.property('string-property', { type: 'string' });
                this.property('number-property', { type: 'number' });
                this.property('boolean-property', { type: 'boolean' });
                this.property('datetime-property', { type: 'datetime' });
                this.property('text-property', { type: 'text' });
                this.property('currency-property', { type: 'currency' });
                this.property('percent-property', { type: 'percent' });
                this.property('locale-property', { type: 'locale' });

                this.property('array-of-strings', { arrayOf: 'string' });
                this.property('array-of-numbers', { arrayOf: 'number' });
                this.property('array-of-booleans', { arrayOf: 'boolean' });
                this.property('array-of-datetimes', { arrayOf: 'datetime' });
                this.property('array-of-texts', { arrayOf: 'text' });
                this.property('array-of-currencies', { arrayOf: 'currency' });
                this.property('array-of-percents', { arrayOf: 'percent' });
                this.property('array-of-locales', { arrayOf: 'locale' });

                this.property('nested-model', {
                    model: Backbone.Model
                });

                this.property('nested-collection', {
                    collection: Backbone.Collection
                });

                this.property('reference-model', {
                    model: Backbone.Model,
                    fromSource: sourceCollection
                });

                this.property('reference-collection', {
                    collection: Backbone.Collection,
                    fromSource: sourceCollection
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
                'datetime-property': new Date('12/12/2012').toString(),
                'text-property': '&lt;b&gt;text&lt;&#x2F;b&gt;',
                'currency-property': 999999.99,
                'percent-property': 0.9999,
                'locale-property': 'HELLO_WORLD',

                'array-of-strings': ['string'],
                'array-of-numbers': [999999.99],
                'array-of-booleans': [true],
                'array-of-datetimes': [new Date('12/12/2012').toString()],
                'array-of-texts': ['&lt;b&gt;text&lt;&#x2F;b&gt;'],
                'array-of-currencies': [999999.99],
                'array-of-percents': [0.9999],
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
        strictEqual(this.model.attributes['string-property'], 'string');
        strictEqual(this.model.attributes['number-property'], 999999.99);
        strictEqual(this.model.attributes['boolean-property'], true);
        strictEqual(this.model.attributes['datetime-property'], new Date('12/12/2012').toString());
        strictEqual(this.model.attributes['text-property'], '&lt;b&gt;text&lt;&#x2F;b&gt;');
        strictEqual(this.model.attributes['currency-property'], 999999.99);
        strictEqual(this.model.attributes['percent-property'], 0.9998999999999999);
        strictEqual(this.model.attributes['locale-property'], 'HELLO_WORLD');

        deepEqual(this.model.attributes['array-of-strings'], ['string']);
        deepEqual(this.model.attributes['array-of-numbers'], [999999.99]);
        deepEqual(this.model.attributes['array-of-booleans'], [true]);
        deepEqual(this.model.attributes['array-of-datetimes'], [new Date('12/12/2012').toString()]);
        deepEqual(this.model.attributes['array-of-texts'], ['&lt;b&gt;text&lt;&#x2F;b&gt;']);
        deepEqual(this.model.attributes['array-of-currencies'], [999999.99]);
        deepEqual(this.model.attributes['array-of-percents'], [0.9998999999999999]);
        deepEqual(this.model.attributes['array-of-locales'], ['HELLO_WORLD']);

        ok(this.model.attributes['nested-model'] instanceof Backbone.Model);
        ok(this.model.attributes['nested-collection'] instanceof Backbone.Collection);

        ok(this.model.attributes['reference-model'] instanceof Backbone.Model);
        ok(this.model.attributes['reference-collection'] instanceof Backbone.Collection);
    });

    test('get string property', function () {
        strictEqual(this.model.get('string-property'), 'string');
    });

    test('get number property', function () {
        strictEqual(this.model.get('number-property'), '999,999.99');
    });

    test('get boolean property', function () {
        strictEqual(this.model.get('boolean-property'), true);
    });

    test('get datetime property', function () {
        strictEqual(this.model.get('datetime-property'), '12/12/2012');
    });

    test('get text property', function () {
        strictEqual(this.model.get('text-property'), '<b>text</b>');
    });

    test('get currency property', function () {
        strictEqual(this.model.get('currency-property'), '$999,999.99');
    });

    test('get percent property', function () {
        strictEqual(this.model.get('percent-property'), '99.99 %');
    });

    test('get locale property', function () {
        strictEqual(this.model.get('locale-property'), 'Hello, World!');
    });

    test('get array of strings', function () {
        deepEqual(this.model.get('array-of-strings'), ['string']);
    });

    test('get array of numbers', function () {
        deepEqual(this.model.get('array-of-numbers'), ['999,999.99']);
    });

    test('get array of booleans', function () {
        deepEqual(this.model.get('array-of-booleans'), [true]);
    });

    test('get array of datetimes', function () {
        deepEqual(this.model.get('array-of-datetimes'), ['12/12/2012']);
    });

    test('get array of texts', function () {
        deepEqual(this.model.get('array-of-texts'), ['<b>text</b>']);
    });

    test('get array of currencies', function () {
        deepEqual(this.model.get('array-of-currencies'), ['$999,999.99']);
    });

    test('get array of percents', function () {
        deepEqual(this.model.get('array-of-percents'), ['99.99 %']);
    });

    test('get array of locales', function () {
        deepEqual(this.model.get('array-of-locales'), ['Hello, World!']);
    });

    test('set and unset string property', function () {
        this.model.set('string-property', 'string');
        strictEqual(this.model.attributes['string-property'], 'string');

        this.model.set('string-property', 999999.99);
        strictEqual(this.model.attributes['string-property'], '999999.99');

        this.model.set('string-property', true);
        strictEqual(this.model.attributes['string-property'], 'true');

        this.model.set('string-property', {});
        strictEqual(this.model.attributes['string-property'], '[object Object]');

        this.model.set('string-property', null);
        strictEqual(this.model.attributes['string-property'], null);

        this.model.set('string-property', undefined);
        strictEqual(this.model.attributes['string-property'], 'default');

        this.model.unset('string-property');
        strictEqual(this.model.attributes['string-property'], undefined);
    });

    test('set and unset number property', function () {
        this.model.set('number-property', '999,999.99');
        strictEqual(this.model.attributes['number-property'], 999999.99);

        this.model.set('number-property', 999999.99);
        strictEqual(this.model.attributes['number-property'], 999999.99);

        this.model.set('number-property', true);
        ok(isNaN(this.model.attributes['number-property']));

        this.model.set('number-property', {});
        ok(isNaN(this.model.attributes['number-property']));

        this.model.set('number-property', null);
        strictEqual(this.model.attributes['number-property'], null);

        this.model.set('number-property', undefined);
        strictEqual(this.model.attributes['number-property'], 0);

        this.model.unset('number-property');
        strictEqual(this.model.attributes['number-property'], undefined);
    });

    test('set and unset boolean property', function () {
        this.model.set('boolean-property', 'true');
        strictEqual(this.model.attributes['boolean-property'], true);

        this.model.set('boolean-property', 999999.99);
        strictEqual(this.model.attributes['boolean-property'], true);

        this.model.set('boolean-property', true);
        strictEqual(this.model.attributes['boolean-property'], true);

        this.model.set('boolean-property', {});
        strictEqual(this.model.attributes['boolean-property'], true);

        this.model.set('boolean-property', null);
        strictEqual(this.model.attributes['boolean-property'], null);

        this.model.set('boolean-property', undefined);
        strictEqual(this.model.attributes['boolean-property'], false);

        this.model.unset('boolean-property');
        strictEqual(this.model.attributes['boolean-property'], undefined);
    });

    test('set and unset datetime property', function () {
        this.model.set('datetime-property', '12/12/2012');
        strictEqual(this.model.attributes['datetime-property'], new Date('12/12/2012').toString());

        this.model.set('datetime-property', 999999.99);
        strictEqual(this.model.attributes['datetime-property'], new Date(999999).toString());

        this.model.set('datetime-property', true);
        strictEqual(this.model.attributes['datetime-property'], new Date(1).toString());

        this.model.set('datetime-property', {});
        ok(isNaN(this.model.attributes['datetime-property']));

        this.model.set('datetime-property', null);
        strictEqual(this.model.attributes['datetime-property'], null);

        this.model.set('datetime-property', undefined);
        strictEqual(this.model.attributes['datetime-property'], new Date('12/12/2012').toString());

        this.model.unset('datetime-property');
        strictEqual(this.model.attributes['datetime-property'], undefined);
    });

    test('set and unset text property', function () {
        this.model.set('text-property', '<b>text</b>');
        strictEqual(this.model.attributes['text-property'], '&lt;b&gt;text&lt;&#x2F;b&gt;');

        this.model.set('text-property', 999999.99);
        strictEqual(this.model.attributes['text-property'], '999999.99');

        this.model.set('text-property', true);
        strictEqual(this.model.attributes['text-property'], 'true');

        this.model.set('text-property', {});
        strictEqual(this.model.attributes['text-property'], '[object Object]');

        this.model.set('text-property', null);
        strictEqual(this.model.attributes['text-property'], null);

        this.model.set('text-property', undefined);
        strictEqual(this.model.attributes['text-property'], 'default');

        this.model.unset('text-property');
        strictEqual(this.model.attributes['text-property'], undefined);
    });

    test('set and unset currency property', function () {
        this.model.set('currency-property', '$999,999.99');
        strictEqual(this.model.attributes['currency-property'], 999999.99);

        this.model.set('currency-property', 999999.99);
        strictEqual(this.model.attributes['currency-property'], 999999.99);

        this.model.set('currency-property', true);
        ok(isNaN(this.model.attributes['currency-property']));

        this.model.set('currency-property', {});
        ok(isNaN(this.model.attributes['currency-property']));

        this.model.set('currency-property', null);
        strictEqual(this.model.attributes['currency-property'], null);

        this.model.set('currency-property', undefined);
        strictEqual(this.model.attributes['currency-property'], 0);

        this.model.unset('currency-property');
        strictEqual(this.model.attributes['currency-property'], undefined);
    });

    test('set and unset percent property', function () {
        this.model.set('percent-property', '99.99 %');
        strictEqual(this.model.attributes['percent-property'], 0.9998999999999999);

        this.model.set('percent-property', 999999.99);
        strictEqual(this.model.attributes['percent-property'], 999999.99);

        this.model.set('percent-property', true);
        ok(isNaN(this.model.attributes['percent-property']));

        this.model.set('percent-property', {});
        ok(isNaN(this.model.attributes['percent-property']));

        this.model.set('percent-property', null);
        strictEqual(this.model.attributes['percent-property'], null);

        this.model.set('percent-property', undefined);
        strictEqual(this.model.attributes['percent-property'], 0);

        this.model.unset('percent-property');
        strictEqual(this.model.attributes['percent-property'], undefined);
    });

    test('set and unset locale property', function () {
        this.model.set('locale-property', 'Hello, World!');
        strictEqual(this.model.attributes['locale-property'], 'HELLO_WORLD');

        this.model.set('locale-property', 999999.99);
        strictEqual(this.model.attributes['locale-property'], '999999.99');

        this.model.set('locale-property', true);
        strictEqual(this.model.attributes['locale-property'], 'true');

        this.model.set('locale-property', {});
        strictEqual(this.model.attributes['locale-property'], '[object Object]');

        this.model.set('locale-property', null);
        strictEqual(this.model.attributes['locale-property'], null);

        this.model.set('locale-property', undefined);
        strictEqual(this.model.attributes['locale-property'], 'default');

        this.model.unset('locale-property');
        strictEqual(this.model.attributes['locale-property'], undefined);
    });

    test('set and unset array of strings', function () {
        this.model.set('array-of-strings', ['string']);
        deepEqual(this.model.attributes['array-of-strings'], ['string']);

        this.model.set('array-of-strings', [999999.99]);
        deepEqual(this.model.attributes['array-of-strings'], ['999999.99']);

        this.model.set('array-of-strings', [true]);
        deepEqual(this.model.attributes['array-of-strings'], ['true']);

        this.model.set('array-of-strings', [{}]);
        deepEqual(this.model.attributes['array-of-strings'], ['[object Object]']);

        this.model.set('array-of-strings', [null]);
        deepEqual(this.model.attributes['array-of-strings'], []);

        this.model.set('array-of-strings', [undefined]);
        deepEqual(this.model.attributes['array-of-strings'], []);

        this.model.unset('array-of-strings');
        deepEqual(this.model.attributes['array-of-strings'], undefined);
    });

    test('set and unset array of numbers', function () {
        this.model.set('array-of-numbers', ['999,999.99']);
        deepEqual(this.model.attributes['array-of-numbers'], [999999.99]);

        this.model.set('array-of-numbers', [999999.99]);
        deepEqual(this.model.attributes['array-of-numbers'], [999999.99]);

        this.model.set('array-of-numbers', [true]);
        ok(isNaN(this.model.attributes['array-of-numbers']));

        this.model.set('array-of-numbers', [{}]);
        ok(isNaN(this.model.attributes['array-of-numbers']));

        this.model.set('array-of-numbers', [null]);
        deepEqual(this.model.attributes['array-of-numbers'], []);

        this.model.set('array-of-numbers', [undefined]);
        deepEqual(this.model.attributes['array-of-numbers'], []);

        this.model.unset('array-of-numbers');
        deepEqual(this.model.attributes['array-of-numbers'], undefined);
    });

    test('set and unset array of booleans', function () {
        this.model.set('array-of-booleans', ['true']);
        deepEqual(this.model.attributes['array-of-booleans'], [true]);

        this.model.set('array-of-booleans', [999999.99]);
        deepEqual(this.model.attributes['array-of-booleans'], [true]);

        this.model.set('array-of-booleans', [true]);
        deepEqual(this.model.attributes['array-of-booleans'], [true]);

        this.model.set('array-of-booleans', [{}]);
        deepEqual(this.model.attributes['array-of-booleans'], [true]);

        this.model.set('array-of-booleans', [null]);
        deepEqual(this.model.attributes['array-of-booleans'], []);

        this.model.set('array-of-booleans', [undefined]);
        deepEqual(this.model.attributes['array-of-booleans'], []);

        this.model.unset('array-of-booleans');
        deepEqual(this.model.attributes['array-of-booleans'], undefined);
    });

    test('set and unset array of datetimes', function () {
        this.model.set('array-of-datetimes', ['12/12/2012']);
        deepEqual(this.model.attributes['array-of-datetimes'], [new Date('12/12/2012').toString()]);

        this.model.set('array-of-datetimes', [999999.99]);
        deepEqual(this.model.attributes['array-of-datetimes'], [new Date(999999).toString()]);

        this.model.set('array-of-datetimes', [true]);
        deepEqual(this.model.attributes['array-of-datetimes'], [new Date(1).toString()]);

        this.model.set('array-of-datetimes', [{}]);
        ok(isNaN(this.model.attributes['array-of-datetimes']));

        this.model.set('array-of-datetimes', [null]);
        deepEqual(this.model.attributes['array-of-datetimes'], []);

        this.model.set('array-of-datetimes', [undefined]);
        deepEqual(this.model.attributes['array-of-datetimes'], []);

        this.model.unset('array-of-datetimes');
        deepEqual(this.model.attributes['array-of-datetimes'], undefined);
    });

    test('set and unset array of texts', function () {
        this.model.set('array-of-texts', ['<b>text</b>']);
        deepEqual(this.model.attributes['array-of-texts'], ['&lt;b&gt;text&lt;&#x2F;b&gt;']);

        this.model.set('array-of-texts', [999999.99]);
        deepEqual(this.model.attributes['array-of-texts'], ['999999.99']);

        this.model.set('array-of-texts', [true]);
        deepEqual(this.model.attributes['array-of-texts'], ['true']);

        this.model.set('array-of-texts', [{}]);
        deepEqual(this.model.attributes['array-of-texts'], ['[object Object]']);

        this.model.set('array-of-texts', [null]);
        deepEqual(this.model.attributes['array-of-texts'], []);

        this.model.set('array-of-texts', [undefined]);
        deepEqual(this.model.attributes['array-of-texts'], []);

        this.model.unset('array-of-texts');
        deepEqual(this.model.attributes['array-of-texts'], undefined);
    });

    test('set and unset array of currencies', function () {
        this.model.set('array-of-currencies', ['$999,999.99']);
        deepEqual(this.model.attributes['array-of-currencies'], [999999.99]);

        this.model.set('array-of-currencies', [999999.99]);
        deepEqual(this.model.attributes['array-of-currencies'], [999999.99]);

        this.model.set('array-of-currencies', [true]);
        ok(isNaN(this.model.attributes['array-of-currencies']));

        this.model.set('array-of-currencies', [{}]);
        ok(isNaN(this.model.attributes['array-of-currencies']));

        this.model.set('array-of-currencies', [null]);
        deepEqual(this.model.attributes['array-of-currencies'], []);

        this.model.set('array-of-currencies', [undefined]);
        deepEqual(this.model.attributes['array-of-currencies'], []);

        this.model.unset('array-of-currencies');
        deepEqual(this.model.attributes['array-of-currencies'], undefined);
    });

    test('set and unset array of percents', function () {
        this.model.set('array-of-percents', ['99.99 %']);
        deepEqual(this.model.attributes['array-of-percents'], [0.9998999999999999]);

        this.model.set('array-of-percents', [999999.99]);
        deepEqual(this.model.attributes['array-of-percents'], [999999.99]);

        this.model.set('array-of-percents', [true]);
        ok(isNaN(this.model.attributes['array-of-percents']));

        this.model.set('array-of-percents', [{}]);
        ok(isNaN(this.model.attributes['array-of-percents']));

        this.model.set('array-of-percents', [null]);
        deepEqual(this.model.attributes['array-of-percents'], []);

        this.model.set('array-of-percents', [undefined]);
        deepEqual(this.model.attributes['array-of-percents'], []);

        this.model.unset('array-of-percents');
        deepEqual(this.model.attributes['array-of-percents'], undefined);
    });

    test('set and unset array of locales', function () {
        this.model.set('array-of-locales', ['Hello, World!']);
        deepEqual(this.model.attributes['array-of-locales'], ['HELLO_WORLD']);

        this.model.set('array-of-locales', [999999.99]);
        deepEqual(this.model.attributes['array-of-locales'], ['999999.99']);

        this.model.set('array-of-locales', [true]);
        deepEqual(this.model.attributes['array-of-locales'], ['true']);

        this.model.set('array-of-locales', [{}]);
        deepEqual(this.model.attributes['array-of-locales'], ['[object Object]']);

        this.model.set('array-of-locales', [null]);
        deepEqual(this.model.attributes['array-of-locales'], []);

        this.model.set('array-of-locales', [undefined]);
        deepEqual(this.model.attributes['array-of-locales'], []);

        this.model.unset('array-of-locales');
        deepEqual(this.model.attributes['array-of-locales'], undefined);
    });

    test('toJSON', function () {
        var json = this.model.toJSON();

        deepEqual(json['nested-model'], { id: 0, value: 'foo' });

        deepEqual(json['nested-collection'], [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        deepEqual(json['reference-model'], 0);
        deepEqual(json['reference-collection'], [1, 2, 3]);
    });
});
