/*!
 * Backbone.Schema v0.1.2
 * https://github.com/DreamTheater/Backbone.Schema
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
        formatters: {
            // String type
            string: function (attribute, value) {
                return value;
            },

            // Number type
            number: function (attribute, value) {
                return Globalize.format(value, 'n');
            },

            // Boolean type
            boolean: function (attribute, value) {
                return value;
            },

            // Date type
            date: function (attribute, value) {
                var date = new Date(value);

                return Globalize.format(date, 'd');
            },

            // Text type
            text: function (attribute, value) {
                return _.unescape(value);
            },

            // Currency type
            currency: function (attribute, value) {
                return Globalize.format(value, 'c');
            },

            // Percent type
            percent: function (attribute, value) {
                return Globalize.format(value, 'p');
            }
        },

        converters: {
            // String type
            string: function (attribute, value) {
                return String(value);
            },

            // Number type
            number: function (attribute, value) {
                var string = this.converters.string.call(this, attribute, value);

                return Globalize.parseFloat(string);
            },

            // Boolean type
            boolean: function (attribute, value) {
                return Boolean(value);
            },

            // Date type
            date: function (attribute, value) {
                var date = Globalize.parseDate(value) || new Date(value);

                return date.getTime();
            },

            // Text type
            text: function (attribute, value) {
                var string = this.converters.string.call(this, attribute, value);

                // Unescape string to prevent overescaping
                string = _.unescape(string);

                return _.escape(string);
            },

            // Currency type
            currency: function (attribute, value) {
                return this.converters.number.call(this, attribute, value);
            },

            // Percent type
            percent: function (attribute, value) {
                var number = this.converters.number.call(this, attribute, value);

                return _.isNumber(value) ? number : number / 100;
            }
        },

        /**
         * @constructor
         */
        constructor: function () {
            // Call parent's constructor
            Model.apply(this, arguments);
        },

        defineProperty: function (attribute, type, options) {

            ///////////////
            // INSURANCE //
            ///////////////

            // Ensure options
            options = options || {};

            ///////////////

            // Initial attribute's value
            var initialValue = this.get(attribute),
                // Default attribute's value
                defaultValue = options['default'],

                // Attribute's formatter
                formatter = this.formatters[type],
                // Attribute's converter
                converter = this.converters[type];

            // Undefined value assigns as null
            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            // Add attribute's formatter to getters
            this.addGetter(attribute, function (attribute, value) {
                // Format value
                return formatter.call(this, attribute, value);
            });

            // Add attribute's converter to setters
            this.addSetter(attribute, function (attribute, value) {
                var attributes = {};

                if (_.isNull(value) || _.isUndefined(value)) {
                    // Set default value
                    attributes[attribute] = defaultValue;
                } else {
                    // Convert value
                    attributes[attribute] = converter.call(this, attribute, value);
                }

                return attributes;
            });

            // Convert attribute's initial value
            return this.set(attribute, initialValue, {
                silent: true
            });
        }
    });
}());
