/*jshint maxstatements:13, maxlen:110 */
(function () {
    'use strict';

    /**
     * @class
     */
    var Schema = Backbone.Schema = function (model) {

        ////////////////
        // PROPERTIES //
        ////////////////

        this.attributes = {};

        ////////////////

        var toJSON = _.bind(function (fn, options) {
                var attributes = fn.call(this.model, options);

                _.each(attributes, function (value, attribute, attributes) {

                    ///////////////////
                    // NORMALIZATION //
                    ///////////////////

                    if (value instanceof Backbone.Model) {
                        value = value.sourceCollection ? value.id : value.toJSON(options);
                    } else if (value instanceof Backbone.Collection) {
                        value = value.sourceCollection ? _.pluck(value.models, 'id') : value.toJSON(options);
                    }

                    ///////////////////

                    attributes[attribute] = value;
                });

                return attributes;
            }, this),

            get = _.bind(function (fn, attribute) {
                var value = fn.call(this.model, attribute);

                return this._composeValue(value, attribute);
            }, this),

            set = _.bind(function (fn, key, value, options) {

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

                _.each(attributes, function (value, attribute, attributes) {
                    var values = this._parseValue(value, attribute, attributes);

                    _.extend(processedAttributes, values);
                }, this);

                return fn.call(this.model, processedAttributes, options);
            }, this);

        this.model = _.extend(model, {
            toJSON: _.wrap(model.toJSON, toJSON),
            get: _.wrap(model.get, get),
            set: _.wrap(model.set, set)
        });
    };

    _.extend(Schema, {
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

                    options = _.extend({
                        fromSource: null,
                        reset: true,

                        parse: true,
                        silent: false
                    }, options);

                    var sourceCollection = options.fromSource, attributes;

                    if (sourceCollection) {
                        value = sourceCollection.get(value);
                    }

                    attributes = value instanceof Backbone.Model ? value.attributes : value;

                    ///////////////////

                    var Model = options.model, model = this.get(attribute);

                    if (model instanceof Model) {
                        if (options.reset) {
                            model.clear().set(attributes, options);
                        } else {
                            model.set(attributes, options);
                        }
                    } else {
                        model = new Model(attributes, options);

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

                    options = _.extend({
                        fromSource: null,
                        reset: true,

                        parse: true,
                        silent: false
                    }, options);

                    var sourceCollection = options.fromSource, models;

                    if (sourceCollection) {
                        value = sourceCollection.filter(function (model) {
                            return _.contains(value, model.id);
                        });
                    }

                    models = value instanceof Backbone.Collection ? value.models : value;

                    ///////////////////

                    var Collection = options.collection, collection = this.get(attribute);

                    if (collection instanceof Collection) {
                        if (options.reset) {
                            collection.reset(models, options);
                        } else {
                            collection.set(models, options);
                        }
                    } else {
                        collection = new Collection(models, options);

                        collection.sourceCollection = sourceCollection;
                    }

                    return collection;
                }
            }
        }
    });

    _.extend(Schema.prototype, {
        define: function (attribute, options) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            var schema;

            if (!attribute || _.isObject(attribute)) {
                schema = attribute;
            } else {
                (schema = {})[attribute] = options;
            }

            ///////////////////

            _.each(schema, function (options, attribute) {
                this._addProperty(attribute, options);
            }, this);

            return this;
        },

        _addProperty: function (attribute, options) {

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

                model = this.model, value = model.attributes[attribute];

            this.attributes[attribute] = _.defaults(options, {
                getter: _.wrap(getter, function (fn, attribute, value) {
                    var results, values = isArray ? value : [value];

                    results = _.map(values, function (value) {
                        return fn.call(this.model, attribute, value, options);
                    }, this);

                    return isArray ? results : results[0];
                }),

                setter: _.wrap(setter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = isArray ? value : [value];

                    _.each(values, function (value) {

                        ///////////////////
                        // NORMALIZATION //
                        ///////////////////

                        value = _.isUndefined(value) ? this._pickDefaultValue(attribute) : value;

                        ///////////////////

                        var result = _.isNull(value) ? value : fn.call(this.model, attribute, value, options);

                        if (!isArray || !_.isNull(result) && !_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = isArray ? results : results[0];

                    return attributes;
                })
            });

            model.set(attribute, value);
        },

        _composeValue: function (value, attribute) {
            var options = this.attributes[attribute] || {}, getter = options.getter;

            return getter ? getter.call(this, attribute, value) : value;
        },

        _parseValue: function (value, attribute, attributes) {
            var options = this.attributes[attribute] || {}, setter = options.setter;

            return setter ? setter.call(this, attribute, value) : _.pick(attributes, attribute);
        },

        _pickDefaultValue: function (attribute) {
            var defaultValue, defaults = _.result(this.model, 'defaults') || {};

            defaultValue = defaults[attribute];

            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            return defaultValue;
        }
    });
}());
