/**
 * Backbone.Schema v0.2.9
 * https://github.com/DreamTheater/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
/*jshint maxlen:104 */
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
            return this.sourceCollection ? this.id : function (fn, options) {
                var attributes = fn.call(this, options);

                _.each(attributes, function (value, attribute, attributes) {
                    if (value instanceof Backbone.Model || value instanceof Backbone.Collection) {
                        attributes[attribute] = value.toJSON(options);
                    }
                });

                return attributes;
            }.call(this, fn, options);
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

        property: function (attribute, options) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            var type = options.type, arrayOf = options.arrayOf, isArray = false;

            if (!type) {
                if (arrayOf) {
                    type = arrayOf;
                    isArray = true;
                } else if (options.model) {
                    type = 'model';
                } else if (options.collection) {
                    type = 'collection';
                }
            }

            ///////////////////

            var processor = this.constructor.processors[type],

                getter = processor.getter,
                setter = processor.setter,

                value = this.attributes[attribute];

            this._schema[attribute] = _.defaults(options, {
                getter: _.wrap(getter, function (fn, attribute, value) {
                    var results, values = isArray ? value : [value];

                    results = _.map(values, function (value) {
                        return fn.call(this, attribute, value, options);
                    });

                    return isArray ? results : results[0];
                }),

                setter: _.wrap(setter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = isArray ? value : [value];

                    _.each(values, function (value) {

                        ///////////////////
                        // NORMALIZATION //
                        ///////////////////

                        value = _.isUndefined(value) ? this._getDefaultValue(attribute) : value;

                        ///////////////////

                        var result = _.isNull(value) ? value : fn.call(this, attribute, value, options);

                        if (!isArray || !_.isNull(result) && !_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = isArray ? results : results[0];

                    return attributes;
                })
            });

            return this.set(attribute, value);
        },

        _formatValue: function (value, attribute) {
            var options = this._schema[attribute] || {}, getter = options.getter;

            return getter ? getter.call(this, attribute, value) : value;
        },

        _convertValue: function (value, attribute, attributes) {
            var options = this._schema[attribute] || {}, setter = options.setter;

            return setter ? setter.call(this, attribute, value) : _.pick(attributes, attribute);
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
        processors: {
            string: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value) {
                    return String(value);
                }
            },

            number: {
                getter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    var decimals = Number(options.decimals);

                    decimals = _.isNaN(decimals) ? 2 : decimals;

                    ///////////////////

                    return Globalize.format(value, 'n' + decimals);
                },

                setter: function (attribute, value) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = String(value);

                    ///////////////////

                    return Globalize.parseFloat(value);
                }
            },

            boolean: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value) {
                    return Boolean(value);
                }
            },

            datetime: {
                getter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = new Date(value);

                    ///////////////////

                    return Globalize.format(value, options.format || 'd');
                },

                setter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = Globalize.parseDate(value, options.format || 'd') || new Date(value);

                    ///////////////////

                    var datetime;

                    switch (options.method) {
                    case 'unix':
                        datetime = value.getTime();
                        break;
                    case 'iso':
                        datetime = value.toISOString();
                        break;
                    default:
                        datetime = value.toString();
                        break;
                    }

                    return datetime;
                }
            },

            text: {
                getter: function (attribute, value) {
                    return _.unescape(value);
                },

                setter: function (attribute, value) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = _.unescape(value);

                    ///////////////////

                    return _.escape(value);
                }
            },

            currency: {
                getter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    var decimals = Number(options.decimals);

                    decimals = _.isNaN(decimals) ? 2 : decimals;

                    ///////////////////

                    return Globalize.format(value, 'c' + decimals);
                },

                setter: function (attribute, value) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = String(value);

                    ///////////////////

                    return Globalize.parseFloat(value);
                }
            },

            percent: {
                getter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    var decimals = Number(options.decimals);

                    decimals = _.isNaN(decimals) ? 2 : decimals;

                    ///////////////////

                    return Globalize.format(value, 'p' + decimals);
                },

                setter: function (attribute, value) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = _.isNumber(value) ? String(value * 100) : String(value);

                    ///////////////////

                    return Globalize.parseFloat(value) / 100;
                }
            },

            locale: {
                getter: function (attribute, value) {
                    return Globalize.localize(value) || value;
                },

                setter: function (attribute, value) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    value = String(value);

                    ///////////////////

                    var match, culture = Globalize.culture(), pairs = _.pairs(culture.messages);

                    match = _.find(pairs, function (pair) {
                        return pair[1] === value;
                    }) || [];

                    return match[0] || value;
                }
            },

            model: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    var sourceCollection = options.fromSource || null;

                    if (sourceCollection) {
                        value = sourceCollection.get(value);
                    }

                    value = value instanceof Backbone.Model ? value.attributes : value;

                    ///////////////////

                    var Model = options.model, model = this.get(attribute);

                    if (model instanceof Model) {
                        model.clear().set(value);
                    } else {
                        model = new Model(value);
                        model.sourceCollection = sourceCollection;
                    }

                    return model;
                }
            },

            collection: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    var sourceCollection = options.fromSource || null;

                    if (sourceCollection) {
                        value = sourceCollection.filter(function (model) {
                            return _.contains(value, model.id);
                        });
                    }

                    value = value instanceof Backbone.Collection ? value.models : value;

                    ///////////////////

                    var Collection = options.collection, collection = this.get(attribute);

                    if (collection instanceof Collection) {
                        collection.reset(value);
                    } else {
                        collection = new Collection(value);
                        collection.sourceCollection = sourceCollection;
                    }

                    return collection;
                }
            }
        }
    });
}());

(function () {
    'use strict';

    ////////////////
    // SUPERCLASS //
    ////////////////

    var Collection = Backbone.Collection;

    ////////////////

    /**
     * @class
     */
    Backbone.Collection = Collection.extend({
        /**
         * @class
         */
        model: Backbone.Model,

        /**
         * @constructor
         */
        constructor: function (models, options) {
            /**
             * @override
             */
            this.initialize = _.wrap(this.initialize, function (fn, models, options) {
                return fn.call(this, models, options);
            });

            Collection.call(this, models, options);
        },

        /**
         * @override
         */
        toJSON: _.wrap(Collection.prototype.toJSON, function (fn, options) {
            return this.sourceCollection ? _.pluck(this.models, 'id') : fn.call(this, options);
        })
    });
}());
