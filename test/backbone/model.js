/*jshint maxstatements:18 */
$(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Model = Backbone.Model.extend({
        defaults: {
            stringProperty: '',
            numberProperty: 0,
            booleanProperty: false,
            dateProperty: 1355307120000,
            textProperty: '',
            currencyProperty: 0,
            percentProperty: 0
        },

        initialize: function () {
            this.property('stringProperty', 'string');
            this.property('numberProperty', 'number');
            this.property('booleanProperty', 'boolean');
            this.property('dateProperty', 'date');
            this.property('textProperty', 'text');
            this.property('currencyProperty', 'currency');
            this.property('percentProperty', 'percent');
        }
    });

    ////////////
    // MODULE //
    ////////////

    module('Backbone.Schema', {
        setup: function () {
            this.model = new Model({
                stringProperty: 'string',
                numberProperty: 999999.99,
                booleanProperty: true,
                dateProperty: Date.parse('12/12/2012'),
                textProperty: '&lt;b&gt;text&lt;&#x2F;b&gt;',
                currencyProperty: 999999.99,
                percentProperty: 0.9999
            });
        }
    });

    ///////////
    // TESTS //
    ///////////

    test('initial values', function () {
        strictEqual(this.model.attributes.stringProperty, 'string');
        strictEqual(this.model.attributes.numberProperty, 999999.99);
        strictEqual(this.model.attributes.booleanProperty, true);
        strictEqual(this.model.attributes.dateProperty, Date.parse('12/12/2012'));
        strictEqual(this.model.attributes.textProperty, '&lt;b&gt;text&lt;&#x2F;b&gt;');
        strictEqual(this.model.attributes.currencyProperty, 999999.99);
        strictEqual(this.model.attributes.percentProperty, 0.9999);
    });

    test('get string', function () {
        strictEqual(this.model.get('stringProperty'), 'string');
    });

    test('get number', function () {
        strictEqual(this.model.get('numberProperty'), '999,999.99');
    });

    test('get boolean', function () {
        strictEqual(this.model.get('booleanProperty'), true);
    });

    test('get date', function () {
        strictEqual(this.model.get('dateProperty'), '12/12/2012');
    });

    test('get text', function () {
        strictEqual(this.model.get('textProperty'), '<b>text</b>');
    });

    test('get currency', function () {
        strictEqual(this.model.get('currencyProperty'), '$999,999.99');
    });

    test('get percent', function () {
        strictEqual(this.model.get('percentProperty'), '99.99 %');
    });

    test('set and unset string', function () {
        this.model.set('stringProperty', 'string');
        strictEqual(this.model.attributes.stringProperty, 'string');

        this.model.set('stringProperty', 999999.99);
        strictEqual(this.model.attributes.stringProperty, '999999.99');

        this.model.set('stringProperty', true);
        strictEqual(this.model.attributes.stringProperty, 'true');

        this.model.set('stringProperty', null);
        strictEqual(this.model.attributes.stringProperty, null);

        this.model.set('stringProperty', undefined);
        strictEqual(this.model.attributes.stringProperty, '');

        this.model.unset('stringProperty');
        strictEqual(this.model.attributes.stringProperty, undefined);
    });

    test('set and unset number', function () {
        this.model.set('numberProperty', '999,999.99');
        strictEqual(this.model.attributes.numberProperty, 999999.99);

        this.model.set('numberProperty', 999999.99);
        strictEqual(this.model.attributes.numberProperty, 999999.99);

        this.model.set('numberProperty', true);
        strictEqual(isNaN(this.model.attributes.numberProperty), true);

        this.model.set('numberProperty', null);
        strictEqual(this.model.attributes.numberProperty, null);

        this.model.set('numberProperty', undefined);
        strictEqual(this.model.attributes.numberProperty, 0);

        this.model.unset('numberProperty');
        strictEqual(this.model.attributes.numberProperty, undefined);
    });

    test('set and unset boolean', function () {
        this.model.set('booleanProperty', 'true');
        strictEqual(this.model.attributes.booleanProperty, true);

        this.model.set('booleanProperty', 999999.99);
        strictEqual(this.model.attributes.booleanProperty, true);

        this.model.set('booleanProperty', true);
        strictEqual(this.model.attributes.booleanProperty, true);

        this.model.set('booleanProperty', null);
        strictEqual(this.model.attributes.booleanProperty, null);

        this.model.set('booleanProperty', undefined);
        strictEqual(this.model.attributes.booleanProperty, false);

        this.model.unset('booleanProperty');
        strictEqual(this.model.attributes.booleanProperty, undefined);
    });

    test('set and unset date', function () {
        this.model.set('dateProperty', '12/12/2012');
        strictEqual(this.model.attributes.dateProperty, Date.parse('12/12/2012'));

        this.model.set('dateProperty', 999999.99);
        strictEqual(this.model.attributes.dateProperty, 999999);

        this.model.set('dateProperty', true);
        strictEqual(this.model.attributes.dateProperty, 1);

        this.model.set('dateProperty', null);
        strictEqual(this.model.attributes.dateProperty, null);

        this.model.set('dateProperty', undefined);
        strictEqual(this.model.attributes.dateProperty, 1355307120000);

        this.model.unset('dateProperty');
        strictEqual(this.model.attributes.dateProperty, undefined);
    });

    test('set and unset text', function () {
        this.model.set('textProperty', '<b>text</b>');
        strictEqual(this.model.attributes.textProperty, '&lt;b&gt;text&lt;&#x2F;b&gt;');

        this.model.set('textProperty', 999999.99);
        strictEqual(this.model.attributes.textProperty, '999999.99');

        this.model.set('textProperty', true);
        strictEqual(this.model.attributes.textProperty, 'true');

        this.model.set('textProperty', null);
        strictEqual(this.model.attributes.textProperty, null);

        this.model.set('textProperty', undefined);
        strictEqual(this.model.attributes.textProperty, '');

        this.model.unset('textProperty');
        strictEqual(this.model.attributes.textProperty, undefined);
    });

    test('set and unset currency', function () {
        this.model.set('currencyProperty', '$999,999.99');
        strictEqual(this.model.attributes.currencyProperty, 999999.99);

        this.model.set('currencyProperty', 999999.99);
        strictEqual(this.model.attributes.currencyProperty, 999999.99);

        this.model.set('currencyProperty', true);
        strictEqual(isNaN(this.model.attributes.currencyProperty), true);

        this.model.set('currencyProperty', null);
        strictEqual(this.model.attributes.currencyProperty, null);

        this.model.set('currencyProperty', undefined);
        strictEqual(this.model.attributes.currencyProperty, 0);

        this.model.unset('currencyProperty');
        strictEqual(this.model.attributes.currencyProperty, undefined);
    });

    test('set and unset percent', function () {
        this.model.set('percentProperty', '99.99 %');
        strictEqual(this.model.attributes.percentProperty, 0.9998999999999999);

        this.model.set('percentProperty', 999999.99);
        strictEqual(this.model.attributes.percentProperty, 999999.99);

        this.model.set('percentProperty', true);
        strictEqual(isNaN(this.model.attributes.percentProperty), true);

        this.model.set('percentProperty', null);
        strictEqual(this.model.attributes.percentProperty, null);

        this.model.set('percentProperty', undefined);
        strictEqual(this.model.attributes.percentProperty, 0);

        this.model.unset('percentProperty');
        strictEqual(this.model.attributes.percentProperty, undefined);
    });

    test('toJSON with option { schema: true }', function () {
        deepEqual(this.model.toJSON(), {
            stringProperty: 'string',
            numberProperty: 999999.99,
            booleanProperty: true,
            dateProperty: Date.parse('12/12/2012'),
            textProperty: '&lt;b&gt;text&lt;&#x2F;b&gt;',
            currencyProperty: 999999.99,
            percentProperty: 0.9999
        });

        deepEqual(this.model.toJSON({ schema: true }), {
            stringProperty: 'string',
            numberProperty: '999,999.99',
            booleanProperty: true,
            dateProperty: '12/12/2012',
            textProperty: '<b>text</b>',
            currencyProperty: '$999,999.99',
            percentProperty: '99.99 %'
        });
    });
});
