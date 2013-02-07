/*!
 * Backbone.Schema v0.1.6
 * https://github.com/DreamTheater/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
/*jshint forin:false, maxparams:4, maxlen:103 */
(function () {
    'use strict';

    // Superclass
    var Model = Backbone.Model;

    /**
     * @class Backbone.Model
     */
    Backbone.Model = Model.extend({
        readers: {
            // Type "string"
            string: function (attribute, value) {
                return value;
            },

            // Type "number"
            number: function (attribute, value) {
                return Globalize.format(value, 'n');
            },

            // Type "boolean"
            boolean: function (attribute, value) {
                return value;
            },

            // Type "date"
            date: function (attribute, value) {
                var date = new Date(value);

                return Globalize.format(date, 'd');
            },

            // Type "text"
            text: function (attribute, value) {
                return _.unescape(value);
            },

            // Type "currency"
            currency: function (attribute, value) {
                return Globalize.format(value, 'c');
            },

            // Type "percent"
            percent: function (attribute, value) {
                return Globalize.format(value, 'p');
            }
        },

        writers: {
            // Type "string"
            string: function (attribute, value) {
                return String(value);
            },

            // Type "number"
            number: function (attribute, value) {
                var string = this.writers.string.call(this, attribute, value);

                return Globalize.parseFloat(string);
            },

            // Type "boolean"
            boolean: function (attribute, value) {
                return Boolean(value);
            },

            // Type "date"
            date: function (attribute, value) {
                var date = Globalize.parseDate(value) || new Date(value);

                return date.getTime();
            },

            // Type "text"
            text: function (attribute, value) {
                var string = this.writers.string.call(this, attribute, value);

                string = _.unescape(string);

                return _.escape(string);
            },

            // Type "currency"
            currency: function (attribute, value) {
                return this.writers.number.call(this, attribute, value);
            },

            // Type "percent"
            percent: function (attribute, value) {
                var number = this.writers.number.call(this, attribute, value);

                return _.isNumber(value) ? number : number / 100;
            }
        },

        /**
         * @constructor
         */
        constructor: function () {

            /////////////////
            // DEFINITIONS //
            /////////////////

            this._readers = {};
            this._writers = {};

            /////////////////

            Model.apply(this, arguments);
        },

        get: _.wrap(Model.prototype.get, function (get, attribute) {
            var value = get.call(this, attribute);

            return this._computeValue(value, attribute);
        }),

        set: _.wrap(Model.prototype.set, function (set, key, value, options) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            var values;

            if (_.isObject(key) || !key) {
                values = key instanceof Model ? key.attributes : key;
                options = value;
            } else {
                (values = {})[key] = value;
            }

            ///////////////////

            var attributes = {}, computedValues;

            for (var attribute in values) {
                computedValues = this._computeValues(values, attribute);

                _.extend(attributes, computedValues);
            }

            return set.call(this, attributes, options);
        }),

        toJSON: _.wrap(Model.prototype.toJSON, function (toJSON, options) {

            ///////////////
            // INSURANCE //
            ///////////////

            options = options || {};

            ///////////////

            var attributes = toJSON.call(this, options);

            if (options.schema) {
                for (var attribute in this._readers) {
                    attributes[attribute] = this.get(attribute);
                }
            }

            return attributes;
        }),

        property: function (attribute, type) {
            var initialValue = this.get(attribute),
                defaultValue = this._getDefaultValue(attribute),

                reader = this.readers[type],
                writer = this.writers[type];

            this.computed(attribute, {
                reader: reader,

                writer: function (attribute, value) {
                    var attributes = {};

                    if (_.isNull(value)) {
                        attributes[attribute] = value;
                    } else if (_.isUndefined(value)) {
                        attributes[attribute] = defaultValue;
                    } else {
                        attributes[attribute] = writer.call(this, attribute, value);
                    }

                    return attributes;
                }
            });

            return this.set(attribute, initialValue, {
                silent: true
            });
        },

        computed: function (attribute, options) {
            this._readers[attribute] = options.reader;
            this._writers[attribute] = options.writer;

            return this;
        },

        _computeValue: function (value, attribute) {
            var reader = this._readers[attribute];

            return reader ? reader.call(this, attribute, value) : value;
        },

        _computeValues: function (values, attribute) {
            var writer = this._writers[attribute];

            return writer ? writer.call(this, attribute, values[attribute]) : values;
        },

        _getDefaultValue: function (attribute) {
            var defaultValue, defaults = _.result(this, 'defaults') || {};

            defaultValue = defaults[attribute];

            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            return defaultValue;
        }
    });
}());
