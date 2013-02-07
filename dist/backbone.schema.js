/*!
 * Backbone.Schema v0.1.6
 * https://github.com/DreamTheater/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
(function () {
    'use strict';

    var Model = Backbone.Model;

    /**
     * @class Backbone.Model
     */
    Backbone.Model = Model.extend({
        readers: {
            string: function (attribute, value) {
                return value;
            },

            number: function (attribute, value) {
                return Globalize.format(value, 'n');
            },

            boolean: function (attribute, value) {
                return value;
            },

            date: function (attribute, value) {
                var date = new Date(value);

                return Globalize.format(date, 'd');
            },

            text: function (attribute, value) {
                return _.unescape(value);
            },

            currency: function (attribute, value) {
                return Globalize.format(value, 'c');
            },

            percent: function (attribute, value) {
                return Globalize.format(value, 'p');
            }
        },

        writers: {
            string: function (attribute, value) {
                return String(value);
            },

            number: function (attribute, value) {
                var string = this.writers.string.call(this, attribute, value);

                return Globalize.parseFloat(string);
            },

            boolean: function (attribute, value) {
                return Boolean(value);
            },

            date: function (attribute, value) {
                var date = Globalize.parseDate(value) || new Date(value);

                return date.getTime();
            },

            text: function (attribute, value) {
                var string = this.writers.string.call(this, attribute, value);

                string = _.unescape(string);

                return _.escape(string);
            },

            currency: function (attribute, value) {
                return this.writers.number.call(this, attribute, value);
            },

            percent: function (attribute, value) {
                var number = this.writers.number.call(this, attribute, value);

                return _.isNumber(value) ? number : number / 100;
            }
        },

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

            if (!key || _.isObject(key)) {
                values = key;
                options = value;
            } else {
                (values = {})[key] = value;
            }

            ///////////////////

            var attributes = {};

            _.each(values, function (value, attribute, values) {
                var computedValues = this._computeValues(values, attribute);

                _.extend(attributes, computedValues);
            }, this);

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
                _.each(this._readers, function (reader, attribute) {
                    attributes[attribute] = this.get(attribute);
                }, this);
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

            this.set(attribute, initialValue, {
                silent: true
            });

            return this;
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
