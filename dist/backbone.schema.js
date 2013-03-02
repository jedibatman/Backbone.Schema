/*!
 * Backbone.Schema v0.2.0
 * https://github.com/DreamTheater/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
(function (Model) {
    'use strict';

    Backbone.Model = Model.extend({
        constructor: function () {

            /////////////////
            // DEFINITIONS //
            /////////////////

            this._formatters = {};
            this._converters = {};

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
                _.each(this._formatters, function (getter, attribute) {
                    attributes[attribute] = this.get(attribute);
                }, this);
            }

            return attributes;
        }),

        property: function (attribute, type) {
            var constructor = this.constructor,

                formatters = constructor.formatters, formatter = formatters[type],
                converters = constructor.converters, converter = converters[type],

                initialValue = this.attributes[attribute];

            this.computed(attribute, {
                getter: _.wrap(formatter, function (formatter, attribute, value) {
                    return formatter.call(formatters, attribute, value);
                }),

                setter: _.wrap(converter, function (converter, attribute, value) {
                    var attributes = {};

                    if (_.isNull(value)) {
                        attributes[attribute] = value;
                    } else if (_.isUndefined(value)) {
                        attributes[attribute] = this._getDefaultValue(attribute);
                    } else {
                        attributes[attribute] = converter.call(converters, attribute, value);
                    }

                    return attributes;
                })
            });

            this.set(attribute, initialValue);

            return this;
        },

        computed: function (attribute, options) {
            this._formatters[attribute] = options.getter;
            this._converters[attribute] = options.setter;

            return this;
        },

        _computeValue: function (value, attribute) {
            var getter = this._formatters[attribute];

            return getter ? getter.call(this, attribute, value) : value;
        },

        _computeValues: function (values, attribute) {
            var setter = this._converters[attribute], value = values[attribute];

            return setter ? setter.call(this, attribute, value) : values;
        },

        _getDefaultValue: function (attribute) {
            var defaultValue, defaults = _.result(this, 'defaults') || {};

            defaultValue = defaults[attribute];

            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            return defaultValue;
        }
    }, {
        formatters: {
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

        converters: {
            string: function (attribute, value) {
                return String(value);
            },

            number: function (attribute, value) {
                var string = this.string(attribute, value);

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
                var string = this.string(attribute, value);

                string = _.unescape(string);

                return _.escape(string);
            },

            currency: function (attribute, value) {
                return this.number(attribute, value);
            },

            percent: function (attribute, value) {
                var number = this.number(attribute, value);

                return _.isNumber(value) ? number : number / 100;
            }
        }
    });
}(Backbone.Model));
