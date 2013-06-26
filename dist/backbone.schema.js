/**
 * Backbone.Schema v0.3.4
 * https://github.com/DreamTheater/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
/*jshint maxstatements:11, maxlen:109 */
(function () {
    'use strict';

    var Schema = Backbone.Schema = function (model) {

        ////////////////////

        this.attributes = {};

        ////////////////////

        this.model = _.extend(model, {
            toJSON: _.wrap(model.toJSON, function (fn, options) {
                var attributes = fn.call(this, options);

                _.each(attributes, function (value, attribute, attributes) {

                    ////////////////////

                    if (value instanceof Backbone.Model) {
                        value = value.sourceCollection ? value.id : value.toJSON(options);
                    } else if (value instanceof Backbone.Collection) {
                        value = value.sourceCollection ? _.pluck(value.models, 'id') : value.toJSON(options);
                    }

                    ////////////////////

                    attributes[attribute] = value;
                });

                return attributes;
            }),

            get: _.wrap(model.get, function (fn, attribute) {

                ////////////////////

                var schema = this.schema;

                ////////////////////

                var value = fn.call(this, attribute), attributes = this.attributes;

                return schema.formatValue(value, attribute, attributes);
            }),

            set: _.wrap(model.set, function (fn, attribute, value, options) {

                ////////////////////

                var attributes;

                if (!attribute || _.isObject(attribute)) {
                    attributes = attribute;
                    options = value;
                } else {
                    (attributes = {})[attribute] = value;
                }

                ////////////////////

                var resultAttributes = {};

                _.each(attributes, function (value, attribute, attributes) {

                    ////////////////////

                    var schema = this.schema;

                    ////////////////////

                    var resultHash = schema.parseValue(value, attribute, attributes);

                    _.extend(resultAttributes, resultHash);
                }, this);

                return fn.call(this, resultAttributes, options);
            })
        }, {
            schema: this
        });
    };

    _.extend(Schema, {
        types: {
            string: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value) {
                    return String(value);
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

            number: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({
                        format: 'n'
                    }, options);

                    ////////////////////

                    return Globalize.format(value, options.format, options.culture);
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    value = String(value);

                    ////////////////////

                    return Globalize.parseFloat(value, options.culture);
                }
            },

            datetime: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({
                        format: 'd'
                    }, options);

                    value = new Date(value);

                    ////////////////////

                    return Globalize.format(value, options.format, options.culture);
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({
                        format: 'd'
                    }, options);

                    value = Globalize.parseDate(value, options.format, options.culture) || new Date(value);

                    ////////////////////

                    var datetime;

                    switch (options.standard) {
                    case 'unix':
                        datetime = value.getTime();
                        break;
                    default:
                        try {
                            datetime = value.toISOString();
                        } catch (error) {
                            datetime = value.toString();
                        }

                        break;
                    }

                    return datetime;
                }
            },

            locale: {
                getter: function (attribute, value, options) {
                    return Globalize.localize(value, options.culture) || value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    value = String(value);

                    ////////////////////

                    var match, culture = Globalize.findClosestCulture(options.culture),

                        pairs = _.pairs(culture.messages);

                    match = _.find(pairs, function (pair) {
                        return pair[1] === value;
                    });

                    return match ? match[0] : value;
                }
            },

            text: {
                getter: function (attribute, value) {
                    return _.unescape(value);
                },

                setter: function (attribute, value) {

                    ////////////////////

                    value = _.unescape(value);

                    ////////////////////

                    return _.escape(value);
                }
            },

            model: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({ reset: true, parse: true }, options);

                    ////////////////////

                    var sourceCollection = options.fromSource,

                        attributes = sourceCollection ? sourceCollection.get(value) : value;

                    ////////////////////

                    var Model = options.model, model = this.get(attribute);

                    if (attributes instanceof Model) {
                        model = attributes;
                    } else if (model instanceof Model) {
                        if (options.reset) {
                            model.clear().set(attributes, options);
                        } else {
                            model.set(attributes, options);
                        }
                    } else {
                        model = new Model(attributes, options);
                    }

                    model.sourceCollection = sourceCollection;

                    return model;
                }
            },

            collection: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({ reset: true, parse: true, silent: false }, options);

                    ////////////////////

                    var sourceCollection = options.fromSource,

                        models = sourceCollection ? sourceCollection.filter(function (model) {
                            return _.contains(value, model.id);
                        }) : value;

                    ////////////////////

                    var Collection = options.collection, collection = this.get(attribute);

                    if (collection instanceof Collection) {
                        if (options.reset) {
                            collection.reset(models, options);
                        } else {
                            collection.set(models, options);
                        }
                    } else {
                        collection = new Collection(models, options);
                    }

                    collection.sourceCollection = sourceCollection;

                    return collection;
                }
            }
        }
    });

    _.extend(Schema.prototype, {
        define: function (attribute, options) {

            ////////////////////

            var attributes;

            if (!attribute || _.isObject(attribute)) {
                attributes = attribute;
            } else {
                (attributes = {})[attribute] = options;
            }

            ////////////////////

            _.each(attributes, function (options, attribute) {
                this._addAttribute(attribute, options);
            }, this);

            return this;
        },

        refreshValue: function (attribute, options) {

            ////////////////////

            var model = this.model;

            ////////////////////

            var value = model.attributes[attribute];

            model.set(attribute, value, options);

            return this;
        },

        defaultValue: function (attribute) {

            ////////////////////

            var model = this.model;

            ////////////////////

            var defaultValue, defaults = _.result(model, 'defaults') || {};

            defaultValue = defaults[attribute];

            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            return defaultValue;
        },

        formatValue: function (value, attribute, attributes) {

            ////////////////////

            var model = this.model;

            ////////////////////

            var options = this.attributes[attribute] || {}, getter = options.getter;

            return getter ? getter.call(model, attribute, value) : attributes[attribute];
        },

        parseValue: function (value, attribute, attributes) {

            ////////////////////

            var model = this.model;

            ////////////////////

            var options = this.attributes[attribute] || {}, setter = options.setter;

            return setter ? setter.call(model, attribute, value) : _.pick(attributes, attribute);
        },

        _addAttribute: function (attribute, options) {

            ////////////////////

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

            ////////////////////

            var processor = this.constructor.types[type],

                getter = processor.getter,
                setter = processor.setter;

            this.attributes[attribute] = _.defaults(options, {
                getter: _.wrap(getter, function (fn, attribute, value) {
                    var results, values = isArray ? value : [value];

                    results = _.map(values, function (value) {
                        return fn.call(this, attribute, value, options);
                    }, this);

                    return isArray ? results : results[0];
                }),

                setter: _.wrap(setter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = isArray ? value : [value];

                    _.each(values, function (value) {

                        ////////////////////

                        var schema = this.schema;

                        ////////////////////

                        value = _.isUndefined(value) ? schema.defaultValue(attribute) : value;

                        ////////////////////

                        var result = _.isNull(value) ? value : fn.call(this, attribute, value, options);

                        if (!isArray || !_.isNull(result) && !_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = isArray ? results : results[0];

                    return attributes;
                })
            });

            this.refreshValue(attribute, options);
        }
    });
}());
