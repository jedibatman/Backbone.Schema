/*jshint maxstatements:16 */
$(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Schema = Backbone.Model.extend({
        initialize: function () {
            this.addProperty('string', 'string');
            this.addProperty('number', 'number');
            this.addProperty('boolean', 'boolean');
            this.addProperty('date', 'date');
            this.addProperty('text', 'text');
            this.addProperty('percent', 'percent');
            this.addProperty('currency', 'currency');
        }
    });

    ////////////
    // MODULE //
    ////////////

    module('Backbone.Schema', {
        setup: function () {
            this.schema = new Schema({
                string: 'string',
                number: 999999.99,
                boolean: true,
                date: Date.parse('12/31/2012'),
                text: '&lt;b&gt;text&lt;&#x2F;b&gt;',
                percent: 0.9999,
                currency: 999999.99
            });
        }
    });

    ///////////
    // TESTS //
    ///////////

    test('get string property', function () {
        equal(this.schema.get('string'), 'string');
    });

    test('get number property', function () {
        equal(this.schema.get('number'), '999,999.99');
    });

    test('get boolean property', function () {
        equal(this.schema.get('boolean'), true);
    });

    test('get date property', function () {
        equal(this.schema.get('date'), '12/31/2012');
    });

    test('get text property', function () {
        equal(this.schema.get('text'), '<b>text</b>');
    });

    test('get percent property', function () {
        equal(this.schema.get('percent'), '99.99 %');
    });

    test('get currency property', function () {
        equal(this.schema.get('currency'), '$999,999.99');
    });

    test('set string property', function () {
        this.schema.set('string', 'string');
        equal(this.schema.attributes.string, 'string');

        this.schema.set('string', 999999.99);
        equal(this.schema.attributes.string, '999999.99');

        this.schema.set('string', true);
        equal(this.schema.attributes.string, 'true');

        this.schema.set('string', null);
        equal(this.schema.attributes.string, null);

        this.schema.set('string', undefined);
        equal(this.schema.attributes.string, null);
    });

    test('set number property', function () {
        this.schema.set('number', '999,999.99');
        equal(this.schema.attributes.number, 999999.99);

        this.schema.set('number', 999999.99);
        equal(this.schema.attributes.number, 999999.99);

        this.schema.set('number', true);
        ok(isNaN(this.schema.attributes.number));

        this.schema.set('number', null);
        equal(this.schema.attributes.number, null);

        this.schema.set('number', undefined);
        equal(this.schema.attributes.number, null);
    });

    test('set boolean property', function () {
        this.schema.set('boolean', 'true');
        equal(this.schema.attributes.boolean, true);

        this.schema.set('boolean', 999999.99);
        equal(this.schema.attributes.boolean, true);

        this.schema.set('boolean', true);
        equal(this.schema.attributes.boolean, true);

        this.schema.set('boolean', null);
        equal(this.schema.attributes.boolean, null);

        this.schema.set('boolean', undefined);
        equal(this.schema.attributes.boolean, null);
    });

    test('set date property', function () {
        this.schema.set('date', '12/31/2012');
        equal(this.schema.attributes.date, Date.parse('12/31/2012'));

        this.schema.set('date', 999999.99);
        equal(this.schema.attributes.date, 999999);

        this.schema.set('date', true);
        equal(this.schema.attributes.date, 1);

        this.schema.set('date', null);
        equal(this.schema.attributes.date, null);

        this.schema.set('date', undefined);
        equal(this.schema.attributes.date, null);
    });

    test('set text property', function () {
        this.schema.set('text', '<b>text</b>');
        equal(this.schema.attributes.text, '&lt;b&gt;text&lt;&#x2F;b&gt;');

        this.schema.set('text', 999999.99);
        equal(this.schema.attributes.text, '999999.99');

        this.schema.set('text', true);
        equal(this.schema.attributes.text, 'true');

        this.schema.set('text', null);
        equal(this.schema.attributes.text, null);

        this.schema.set('text', undefined);
        equal(this.schema.attributes.text, null);
    });

    test('set percent property', function () {
        this.schema.set('percent', '99.99 %');
        equal(this.schema.attributes.percent, 0.9998999999999999);

        this.schema.set('percent', 999999.99);
        equal(this.schema.attributes.percent, 9999.9999);

        this.schema.set('percent', true);
        ok(isNaN(this.schema.attributes.percent));

        this.schema.set('percent', null);
        equal(this.schema.attributes.percent, null);

        this.schema.set('percent', undefined);
        equal(this.schema.attributes.percent, null);
    });

    test('set currency property', function () {
        this.schema.set('currency', '$99.99');
        equal(this.schema.attributes.currency, 99.99);

        this.schema.set('currency', 999999.99);
        equal(this.schema.attributes.currency, 999999.99);

        this.schema.set('currency', true);
        ok(isNaN(this.schema.attributes.currency));

        this.schema.set('currency', null);
        equal(this.schema.attributes.currency, null);

        this.schema.set('currency', undefined);
        equal(this.schema.attributes.currency, null);
    });
});
