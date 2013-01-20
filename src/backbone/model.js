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
                return Globalize.format(value / 100, 'p');
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
                var string = this.writers.string.call(this, value);

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
                var string = this.writers.string.call(this, value);

                return _.escape(string);
            },

            // Percent type
            percent: function (value) {
                return this.writers.number.call(this, value);
            },

            // Currency type
            currency: function (value) {
                return this.writers.number.call(this, value);
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
                return reader.call(this, value);
            });

            // Add attribute's writer
            this.addSetter(attribute, function (attribute, value) {
                var attributes = {};

                if (_.isNull(value) || _.isUndefined(value)) {
                    // Set default value
                    attributes[attribute] = defaultValue;
                } else {
                    // Convert value using writer
                    attributes[attribute] = writer.call(this, value);
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
