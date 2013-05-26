(function () {
    'use strict';

    ////////////////
    // SUPERCLASS //
    ////////////////

    var Model = Backbone.Model;

    ////////////////

    /**
     * @function
     */
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

            var convertedAttributes = {};

            forEach(attributes, function (value, attribute, attributes) {
                var convertedValues = this._convertValue(value, attribute, attributes);

                forEach(convertedValues, function (convertedValue, attribute) {
                    convertedAttributes[attribute] = convertedValue;
                });
            }, this);

            return fn.call(this, convertedAttributes, options);
        }),

        property: function (attribute, type) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            var match = type.match(/^([-\w]+)(\[\])?$/),

                dataType = match[1],
                isArrayType = !!match[2];

            ///////////////////

            var constructor = this.constructor,

                formatters = constructor.formatters, formatter = formatters[dataType],
                converters = constructor.converters, converter = converters[dataType],

                initialValue = this.attributes[attribute];

            this.computed(attribute, {
                getter: _.wrap(formatter, function (fn, attribute, value) {
                    var results, values = _.isArray(value) ? value : [value];

                    results = _.map(values, function (value) {
                        return fn.call(formatters, value);
                    });

                    return isArrayType ? results : results[0];
                }),

                setter: _.wrap(converter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = _.isArray(value) ? value : [value];

                    _.each(values, function (value, index) {
                        var result;

                        if (_.isNull(value)) {
                            result = value;
                        } else if (_.isUndefined(value)) {
                            result = this._getDefaultValue(attribute, isArrayType ? index : null);
                        } else {
                            result = fn.call(converters, value);
                        }

                        if (!_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = isArrayType ? results : results[0];

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

            return getter ? getter.call(this, attribute, value) : value;
        },

        _convertValue: function (value, attribute, attributes) {
            var setter = this._setters[attribute];

            return setter ? setter.call(this, attribute, value) : attributes;
        },

        _getDefaultValue: function (attribute, index) {
            var defaultValue, defaults = _.result(this, 'defaults') || {};

            defaultValue = defaults[attribute];

            if (_.isNumber(index)) {
                defaultValue = (defaultValue || [])[index];
            } else if (_.isUndefined(defaultValue)) {
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
            },

            locale: function (value) {
                return Globalize.localize(value) || value;
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

                return _.isNumber(value) ? number : number / 100;
            },

            locale: function (value) {
                var match, culture = Globalize.culture(), pairs = _.pairs(culture.messages);

                match = _.find(pairs, function (pair) {
                    return pair[1] === value;
                }) || [];

                return match[0] || this.string(value);
            }
        }
    });
}());
