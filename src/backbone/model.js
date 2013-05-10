(function () {
    'use strict';

    ////////////////
    // SUPERCLASS //
    ////////////////

    var Model = Backbone.Model;

    ////////////////

    function forEach(object, iterator, context) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                iterator.call(context, object[key], key, object);
            }
        }
    }

    /**
     * @class
     */
    Backbone.Model = Model.extend({
        /**
         * @constructor
         */
        constructor: function (attributes, options) {

            ////////////////
            // PROPERTIES //
            ////////////////

            this._getters = {};
            this._setters = {};

            ////////////////

            Model.call(this, attributes, options);
        },

        /**
         * @override
         */
        toJSON: _.wrap(Model.prototype.toJSON, function (fn, options) {

            ///////////////
            // INSURANCE //
            ///////////////

            options = options || {};

            ///////////////

            var attributes = fn.call(this, options), getters = this._getters;

            if (options.schema) {
                forEach(getters, function (getter, attribute) {
                    attributes[attribute] = this.get(attribute);
                }, this);
            }

            return attributes;
        }),

        /**
         * @override
         */
        get: _.wrap(Model.prototype.get, function (fn, attribute) {
            var value = fn.call(this, attribute);

            return this._formatValue(value, attribute);
        }),

        /**
         * @override
         */
        set: _.wrap(Model.prototype.set, function (fn, key, value, options) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            var attributes;

            if (!key || _.isObject(key)) {
                attributes = key;
                options = value;
            } else {
                (attributes = {})[key] = value;
            }

            ///////////////////

            var processedAttributes = {};

            forEach(attributes, function (value, attribute, attributes) {
                var results = this._convertValue(value, attribute, attributes);

                forEach(results, function (value, attribute) {
                    processedAttributes[attribute] = value;
                });
            }, this);

            return fn.call(this, processedAttributes, options);
        }),

        property: function (attribute, type) {
            var constructor = this.constructor,

                formatters = constructor.formatters, formatter = formatters[type],
                converters = constructor.converters, converter = converters[type],

                initialValue = this.attributes[attribute];

            this.computed(attribute, {
                getter: _.wrap(formatter, function (fn, attribute, value) {
                    return fn.call(formatters, value);
                }),

                setter: _.wrap(converter, function (fn, attribute, value) {
                    var attributes = {};

                    if (_.isNull(value)) {
                        attributes[attribute] = value;
                    } else if (_.isUndefined(value)) {
                        attributes[attribute] = this._getDefaultValue(attribute);
                    } else {
                        attributes[attribute] = fn.call(converters, value);
                    }

                    return attributes;
                })
            });

            this.set(attribute, initialValue);

            return this;
        },

        computed: function (attribute, options) {
            this._getters[attribute] = options.getter;
            this._setters[attribute] = options.setter;

            return this;
        },

        _formatValue: function (value, attribute) {
            var getter = this._getters[attribute];

            return (getter ? getter.call(this, attribute, value) : value);
        },

        _convertValue: function (value, attribute, attributes) {
            var setter = this._setters[attribute];

            return (setter ? setter.call(this, attribute, value) : attributes);
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
            string: function (value) {
                return value;
            },

            number: function (value) {
                return Globalize.format(value, 'n');
            },

            boolean: function (value) {
                return value;
            },

            date: function (value) {
                var date = new Date(value);

                return Globalize.format(date, 'd');
            },

            text: function (value) {
                return _.unescape(value);
            },

            currency: function (value) {
                return Globalize.format(value, 'c');
            },

            percent: function (value) {
                return Globalize.format(value, 'p');
            }
        },

        converters: {
            string: function (value) {
                return String(value);
            },

            number: function (value) {
                var string = this.string(value);

                return Globalize.parseFloat(string);
            },

            boolean: function (value) {
                return Boolean(value);
            },

            date: function (value) {
                var date = Globalize.parseDate(value) || new Date(value);

                return date.getTime();
            },

            text: function (value) {
                var string = this.string(value);

                string = _.unescape(string);

                return _.escape(string);
            },

            currency: function (value) {
                return this.number(value);
            },

            percent: function (value) {
                var number = this.number(value);

                return (_.isNumber(value) ? number : number / 100);
            }
        }
    });
}());
