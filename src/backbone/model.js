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

            this._schema = {};

            ////////////////

            /**
             * @override
             */
            this.initialize = _.wrap(this.initialize, function (fn, attributes, options) {
                return fn.call(this, attributes, options);
            });

            Model.call(this, attributes, options);
        },

        /**
         * @override
         */
        toJSON: _.wrap(Model.prototype.toJSON, function (fn, options) {
            var attributes = fn.call(this, options);

            _.each(attributes, function (value, attribute, attributes) {
                var toJSON;

                if (value && _.isFunction(toJSON = value.toJSON)) {
                    attributes[attribute] = toJSON.call(value, options);
                }
            });

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

            var convertedAttributes = {};

            forEach(attributes, function (value, attribute, attributes) {
                var convertedValues = this._convertValue(value, attribute, attributes);

                forEach(convertedValues, function (convertedValue, attribute) {
                    convertedAttributes[attribute] = convertedValue;
                });
            }, this);

            return fn.call(this, convertedAttributes, options);
        }),

        property: function (attribute, type, options) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            var match = type.match(/^([-\w]+)(\[\])?$/), isArray = !!match[2];

            type = match[1];
            options = options || {};

            ///////////////////

            var value = this.attributes[attribute], constructor = this.constructor,

                formatters = constructor.formatters, formatter = formatters[type],
                converters = constructor.converters, converter = converters[type];

            _.defaults(options, {
                getter: _.wrap(formatter, function (fn, attribute, value) {
                    var results, values = _.isArray(value) ? value : [value];

                    results = _.map(values, function (value) {
                        return fn.call(formatters, value, options);
                    });

                    return isArray ? results : results[0];
                }),

                setter: _.wrap(converter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = _.isArray(value) ? value : [value];

                    _.each(values, function (value) {
                        var result;

                        if (type !== 'model' && type !== 'collection') {
                            if (_.isNull(value)) {
                                result = value;
                            } else if (_.isUndefined(value)) {
                                result = isArray ? value : this._getDefaultValue(attribute);
                            } else {
                                result = fn.call(converters, value, options);
                            }
                        } else {
                            result = fn.call(converters, value, options);
                        }

                        if (!_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = isArray ? results : results[0];

                    return attributes;
                })
            });

            this.computed(attribute, options);

            this.set(attribute, value);

            return this;
        },

        computed: function (attribute, options) {
            this._schema[attribute] = options;

            return this;
        },

        _formatValue: function (value, attribute) {
            var options = this._schema[attribute] || {}, getter = options.getter;

            return getter ? getter.call(this, attribute, value) : value;
        },

        _convertValue: function (value, attribute, attributes) {
            var options = this._schema[attribute] || {}, setter = options.setter;

            return setter ? setter.call(this, attribute, value) : attributes;
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
            },

            locale: function (value) {
                return Globalize.localize(value) || value;
            },

            model: function (value) {
                return value;
            },

            collection: function (value) {
                return value;
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
            },

            model: function (value, options) {
                var Model = options.model || Backbone.Model;

                return value instanceof Model ? value : new Model(value);
            },

            collection: function (value, options) {
                var Collection = options.collection || Backbone.Collection;

                return value instanceof Collection ? value : new Collection(value);
            }
        }
    });
}());
