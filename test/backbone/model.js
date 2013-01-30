/*jshint maxstatements:18 */
$(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Model = Backbone.Model.extend({
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
            this.model = new Model({
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
        strictEqual(this.model.attributes.string, 'string');
        strictEqual(this.model.attributes.number, 999999.99);
        strictEqual(this.model.attributes.boolean, true);
        strictEqual(this.model.attributes.date, Date.parse('12/31/2012'));
        strictEqual(this.model.attributes.text, _.escape('<b>text</b>'));
        strictEqual(this.model.attributes.currency, 999999.99);
        strictEqual(this.model.attributes.percent, 0.9999);
    });

    test('get string property', function () {
        strictEqual(this.model.get('string'), 'string');
    });

    test('get number property', function () {
        strictEqual(this.model.get('number'), '999,999.99');
    });

    test('get boolean property', function () {
        strictEqual(this.model.get('boolean'), true);
    });

    test('get date property', function () {
        strictEqual(this.model.get('date'), '12/31/2012');
    });

    test('get text property', function () {
        strictEqual(this.model.get('text'), '<b>text</b>');
    });

    test('get currency property', function () {
        strictEqual(this.model.get('currency'), '$999,999.99');
    });

    test('get percent property', function () {
        strictEqual(this.model.get('percent'), '99.99 %');
    });

    test('set string property', function () {
        this.model.set('string', 'string');
        strictEqual(this.model.attributes.string, 'string');

        this.model.set('string', 999999.99);
        strictEqual(this.model.attributes.string, '999999.99');

        this.model.set('string', true);
        strictEqual(this.model.attributes.string, 'true');

        this.model.set('string', null);
        strictEqual(this.model.attributes.string, null);

        this.model.set('string', undefined);
        strictEqual(this.model.attributes.string, null);
    });

    test('set number property', function () {
        this.model.set('number', '999,999.99');
        strictEqual(this.model.attributes.number, 999999.99);

        this.model.set('number', 999999.99);
        strictEqual(this.model.attributes.number, 999999.99);

        this.model.set('number', true);
        strictEqual(isNaN(this.model.attributes.number), true);

        this.model.set('number', null);
        strictEqual(this.model.attributes.number, null);

        this.model.set('number', undefined);
        strictEqual(this.model.attributes.number, null);
    });

    test('set boolean property', function () {
        this.model.set('boolean', 'true');
        strictEqual(this.model.attributes.boolean, true);

        this.model.set('boolean', 999999.99);
        strictEqual(this.model.attributes.boolean, true);

        this.model.set('boolean', true);
        strictEqual(this.model.attributes.boolean, true);

        this.model.set('boolean', null);
        strictEqual(this.model.attributes.boolean, null);

        this.model.set('boolean', undefined);
        strictEqual(this.model.attributes.boolean, null);
    });

    test('set date property', function () {
        this.model.set('date', '12/31/2012');
        strictEqual(this.model.attributes.date, Date.parse('12/31/2012'));

        this.model.set('date', 999999.99);
        strictEqual(this.model.attributes.date, 999999);

        this.model.set('date', true);
        strictEqual(this.model.attributes.date, 1);

        this.model.set('date', null);
        strictEqual(this.model.attributes.date, null);

        this.model.set('date', undefined);
        strictEqual(this.model.attributes.date, null);
    });

    test('set text property', function () {
        this.model.set('text', '<b>text</b>');
        strictEqual(this.model.attributes.text, _.escape('<b>text</b>'));

        this.model.set('text', 999999.99);
        strictEqual(this.model.attributes.text, '999999.99');

        this.model.set('text', true);
        strictEqual(this.model.attributes.text, 'true');

        this.model.set('text', null);
        strictEqual(this.model.attributes.text, null);

        this.model.set('text', undefined);
        strictEqual(this.model.attributes.text, null);
    });

    test('set currency property', function () {
        this.model.set('currency', '$999,999.99');
        strictEqual(this.model.attributes.currency, 999999.99);

        this.model.set('currency', 999999.99);
        strictEqual(this.model.attributes.currency, 999999.99);

        this.model.set('currency', true);
        strictEqual(isNaN(this.model.attributes.currency), true);

        this.model.set('currency', null);
        strictEqual(this.model.attributes.currency, null);

        this.model.set('currency', undefined);
        strictEqual(this.model.attributes.currency, null);
    });

    test('set percent property', function () {
        this.model.set('percent', '99.99 %');
        strictEqual(this.model.attributes.percent, 0.9998999999999999);

        this.model.set('percent', 999999.99);
        strictEqual(this.model.attributes.percent, 999999.99);

        this.model.set('percent', true);
        strictEqual(isNaN(this.model.attributes.percent), true);

        this.model.set('percent', null);
        strictEqual(this.model.attributes.percent, null);

        this.model.set('percent', undefined);
        strictEqual(this.model.attributes.percent, null);
    });

    test('add property with options', function () {
        this.model.defineProperty('index', 'number', { index: true });
        strictEqual(this.model.idAttribute, 'index');

        this.model.defineProperty('default', 'number', { 'default': 0 });
        strictEqual(this.model.attributes['default'], 0);
    });
});
