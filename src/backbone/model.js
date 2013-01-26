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

        writers: {
            // String type
            string: function (attribute, value) {
                return String(value);
            },

            // Number type
            number: function (attribute, value) {
                var string = this.writers.string.call(this, attribute, value);

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
                var string = this.writers.string.call(this, attribute, value);

                return _.escape(string);
            },

            // Currency type
            currency: function (attribute, value) {
                return this.writers.number.call(this, attribute, value);
            },

            // Percent type
            percent: function (attribute, value) {
                var number = this.writers.number.call(this, attribute, value);

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

        addProperty: function (attribute, type, options) {

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

                // Attribute's converters
                reader = this.readers[type],
                writer = this.writers[type];

            // Undefined value assigns as null
            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            // Set index attribute
            this.idAttribute = options.index ? attribute : this.idAttribute;

            // Add attribute's reader
            this.addGetter(attribute, function (attribute, value) {
                return reader.call(this, attribute, value);
            });

            // Add attribute's writer
            this.addSetter(attribute, function (attribute, value) {
                var attributes = {};

                if (_.isNull(value) || _.isUndefined(value)) {
                    // Set default value
                    attributes[attribute] = defaultValue;
                } else {
                    // Convert value using writer
                    attributes[attribute] = writer.call(this, attribute, value);
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
