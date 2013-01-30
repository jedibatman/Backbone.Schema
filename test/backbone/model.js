/*jshint maxstatements:18 */
$(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Schema = Backbone.Model.extend({
        initialize: function () {
            this.defineProperty('string', 'string');
            this.defineProperty('number', 'number');
            this.defineProperty('boolean', 'boolean');
            this.defineProperty('date', 'date');
            this.defineProperty('text', 'text');
            this.defineProperty('currency', 'currency');
            this.defineProperty('percent', 'percent');
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
                text: _.escape('<b>text</b>'),
                currency: 999999.99,
                percent: 0.9999
            });
        }
    });

    ///////////
    // TESTS //
    ///////////

    test('initial attributes values', function () {
        strictEqual(this.schema.attributes.string, 'string');
        strictEqual(this.schema.attributes.number, 999999.99);
        strictEqual(this.schema.attributes.boolean, true);
        strictEqual(this.schema.attributes.date, Date.parse('12/31/2012'));
        strictEqual(this.schema.attributes.text, _.escape('<b>text</b>'));
        strictEqual(this.schema.attributes.currency, 999999.99);
        strictEqual(this.schema.attributes.percent, 0.9999);
    });

    test('get string property', function () {
        strictEqual(this.schema.get('string'), 'string');
    });

    test('get number property', function () {
        strictEqual(this.schema.get('number'), '999,999.99');
    });

    test('get boolean property', function () {
        strictEqual(this.schema.get('boolean'), true);
    });

    test('get date property', function () {
        strictEqual(this.schema.get('date'), '12/31/2012');
    });

    test('get text property', function () {
        strictEqual(this.schema.get('text'), '<b>text</b>');
    });

    test('get currency property', function () {
        strictEqual(this.schema.get('currency'), '$999,999.99');
    });

    test('get percent property', function () {
        strictEqual(this.schema.get('percent'), '99.99 %');
    });

    test('set string property', function () {
        this.schema.set('string', 'string');
        strictEqual(this.schema.attributes.string, 'string');

        this.schema.set('string', 999999.99);
        strictEqual(this.schema.attributes.string, '999999.99');

        this.schema.set('string', true);
        strictEqual(this.schema.attributes.string, 'true');

        this.schema.set('string', null);
        strictEqual(this.schema.attributes.string, null);

        this.schema.set('string', undefined);
        strictEqual(this.schema.attributes.string, null);
    });

    test('set number property', function () {
        this.schema.set('number', '999,999.99');
        strictEqual(this.schema.attributes.number, 999999.99);

        this.schema.set('number', 999999.99);
        strictEqual(this.schema.attributes.number, 999999.99);

        this.schema.set('number', true);
        strictEqual(isNaN(this.schema.attributes.number), true);

        this.schema.set('number', null);
        strictEqual(this.schema.attributes.number, null);

        this.schema.set('number', undefined);
        strictEqual(this.schema.attributes.number, null);
    });

    test('set boolean property', function () {
        this.schema.set('boolean', 'true');
        strictEqual(this.schema.attributes.boolean, true);

        this.schema.set('boolean', 999999.99);
        strictEqual(this.schema.attributes.boolean, true);

        this.schema.set('boolean', true);
        strictEqual(this.schema.attributes.boolean, true);

        this.schema.set('boolean', null);
        strictEqual(this.schema.attributes.boolean, null);

        this.schema.set('boolean', undefined);
        strictEqual(this.schema.attributes.boolean, null);
    });

    test('set date property', function () {
        this.schema.set('date', '12/31/2012');
        strictEqual(this.schema.attributes.date, Date.parse('12/31/2012'));

        this.schema.set('date', 999999.99);
        strictEqual(this.schema.attributes.date, 999999);

        this.schema.set('date', true);
        strictEqual(this.schema.attributes.date, 1);

        this.schema.set('date', null);
        strictEqual(this.schema.attributes.date, null);

        this.schema.set('date', undefined);
        strictEqual(this.schema.attributes.date, null);
    });

    test('set text property', function () {
        this.schema.set('text', '<b>text</b>');
        strictEqual(this.schema.attributes.text, _.escape('<b>text</b>'));

        this.schema.set('text', 999999.99);
        strictEqual(this.schema.attributes.text, '999999.99');

        this.schema.set('text', true);
        strictEqual(this.schema.attributes.text, 'true');

        this.schema.set('text', null);
        strictEqual(this.schema.attributes.text, null);

        this.schema.set('text', undefined);
        strictEqual(this.schema.attributes.text, null);
    });

    test('set currency property', function () {
        this.schema.set('currency', '$999,999.99');
        strictEqual(this.schema.attributes.currency, 999999.99);

        this.schema.set('currency', 999999.99);
        strictEqual(this.schema.attributes.currency, 999999.99);

        this.schema.set('currency', true);
        strictEqual(isNaN(this.schema.attributes.currency), true);

        this.schema.set('currency', null);
        strictEqual(this.schema.attributes.currency, null);

        this.schema.set('currency', undefined);
        strictEqual(this.schema.attributes.currency, null);
    });

    test('set percent property', function () {
        this.schema.set('percent', '99.99 %');
        strictEqual(this.schema.attributes.percent, 0.9998999999999999);

        this.schema.set('percent', 999999.99);
        strictEqual(this.schema.attributes.percent, 999999.99);

        this.schema.set('percent', true);
        strictEqual(isNaN(this.schema.attributes.percent), true);

        this.schema.set('percent', null);
        strictEqual(this.schema.attributes.percent, null);

        this.schema.set('percent', undefined);
        strictEqual(this.schema.attributes.percent, null);
    });

    test('add property with options', function () {
        this.schema.defineProperty('index', 'number', { index: true });
        strictEqual(this.schema.idAttribute, 'index');

        this.schema.defineProperty('default', 'number', { 'default': 0 });
        strictEqual(this.schema.attributes['default'], 0);
    });
});
