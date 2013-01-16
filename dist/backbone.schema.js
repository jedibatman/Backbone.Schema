/*!
 * Backbone.Schema v0.1.0
 * http://dreamtheater.github.com/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
(function () {
    'use strict';

    // Superclass
    var Model = Backbone.Model;

    /**
     * @class Backbone.Model
     */
    Backbone.Model = Model.extend({
        readers: {
            // String type
            string: function (value) {
                return value;
            },

            // Number type
            number: function (value) {
                return Globalize.format(value, 'n');
            },

            // Boolean type
            boolean: function (value) {
                return value;
            },

            // Date type
            date: function (value) {
                var date = new Date(value);

                return Globalize.format(date, 'd');
            },

            // Text type
            text: function (value) {
                return _.unescape(value);
            },

            // Percent type
            percent: function (value) {
                return Globalize.format(value, 'p');
            },

            // Currency type
            currency: function (value) {
                return Globalize.format(value, 'c');
            }
        },

        writers: {
            // String type
            string: function (value) {
                return String(value);
            },

            // Number type
            number: function (value) {
                var string = this.string(value);

                return Globalize.parseFloat(string);
            },

            // Boolean type
            boolean: function (value) {
                return Boolean(value);
            },

            // Date type
            date: function (value) {
                var date = Globalize.parseDate(value) || new Date(value);

                return date.getTime();
            },

            // Text type
            text: function (value) {
                var string = this.string(value);

                return _.escape(string);
            },

            // Percent type
            percent: function (value) {
                var number = this.number(value);

                return number / 100;
            },

            // Currency type
            currency: function (value) {
                return this.number(value);
            }
        },

        /**
         * @constructor
         */
        constructor: function () {
            // Call parent constructor
            Model.apply(this, arguments);
        },

        addProperty: function (attribute, type, options) {

            ///////////////
            // INSURANCE //
            ///////////////

            // Ensure options
            options = options || {};

            ///////////////

            // Set index attribute
            this.idAttribute = options.index || this.idAttribute;

            // Add attribute reader
            this.addGetter(attribute, function (attribute, value) {
                return this.readers[type](value);
            });

            // Add attribute writer
            this.addSetter(attribute, function (attribute, value) {
                var attributes = {};

                if (_.isNull(value) || _.isUndefined(value)) {
                    // Try to set default value
                    attributes[attribute] = options['default'] || null;
                } else {
                    // Convert value using writer
                    attributes[attribute] = this.writers[type](value);
                }

                return attributes;
            });

            return this;
        }
    });
}());
