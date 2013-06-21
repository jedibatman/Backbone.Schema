/**
 * Backbone.Schema v0.3.2
 * https://github.com/DreamTheater/Backbone.Schema
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
/*jshint maxstatements:12, maxlen:110 */
(function () {
    'use strict';

    var Schema = Backbone.Schema = function (model) {

        ////////////////////

        this.attributes = {};

        ////////////////////

        var toJSON = _.bind(function (fn, options) {

                ////////////////////

                var model = this.model;

                ////////////////////

                var attributes = fn.call(model, options);

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
            }, this),

            get = _.bind(function (fn, attribute) {

                ////////////////////

                var model = this.model;

                ////////////////////

                var value = fn.call(model, attribute), attributes = model.attributes;

                return this._formatValue(value, attribute, attributes);
            }, this),

            set = _.bind(function (fn, attribute, value, options) {

                ////////////////////

                var model = this.model;

                ////////////////////

                var attributes;

                if (!attribute || _.isObject(attribute)) {
                    attributes = attribute;
                    options = value;
                } else {
                    (attributes = {})[attribute] = value;
                }

                ////////////////////

                var processedAttributes = {};

                _.each(attributes, function (value, attribute, attributes) {
                    var values = this._parseValue(value, attribute, attributes);

                    _.extend(processedAttributes, values);
                }, this);

                return fn.call(model, processedAttributes, options);
            }, this);

        this.model = _.extend(model, {
            toJSON: _.wrap(model.toJSON, toJSON),
            get: _.wrap(model.get, get),
            set: _.wrap(model.set, set)
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

            number: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({
                        format: 'n'
                    }, options);

                    ////////////////////

                    return Globalize.format(value, options.format);
                },

                setter: function (attribute, value) {

                    ////////////////////

                    value = String(value);

                    ////////////////////

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

                    ////////////////////

                    options = _.extend({
                        format: 'd'
                    }, options);

                    value = new Date(value);

                    ////////////////////

                    return Globalize.format(value, options.format);
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    options = _.extend({
                        format: 'd'
                    }, options);

                    value = Globalize.parseDate(value, options.format) || new Date(value);

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

            locale: {
                getter: function (attribute, value) {
                    return Globalize.localize(value) || value;
                },

                setter: function (attribute, value) {

                    ////////////////////

                    value = String(value);

                    ////////////////////

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

                    ////////////////////

                    options = _.extend({ reset: true, parse: true, silent: false }, options);

                    ////////////////////

                    var sourceCollection = options.fromSource, attributes;

                    value = sourceCollection ? sourceCollection.get(value) : value;
                    attributes = value instanceof Backbone.Model ? value.attributes : value;

                    ////////////////////

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

                    ////////////////////

                    options = _.extend({ reset: true, parse: true, silent: false }, options);

                    ////////////////////

                    var sourceCollection = options.fromSource, models;

                    value = sourceCollection ? sourceCollection.filter(function (model) {
                        return _.contains(value, model.id);
                    }) : value;

                    models = value instanceof Backbone.Collection ? value.models : value;

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
                        collection.sourceCollection = sourceCollection;
                    }

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

            this._refreshValues(attributes);

            return this;
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

                        ////////////////////

                        var model = this.model;

                        ////////////////////

                        return fn.call(model, attribute, value, options);
                    }, this);

                    return isArray ? results : results[0];
                }),

                setter: _.wrap(setter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = isArray ? value : [value];

                    _.each(values, function (value) {

                        ////////////////////

                        var model = this.model;

                        ////////////////////

                        value = _.isUndefined(value) ? this._pickDefaultValue(attribute) : value;

                        ////////////////////

                        var result = _.isNull(value) ? value : fn.call(model, attribute, value, options);

                        if (!isArray || !_.isNull(result) && !_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = isArray ? results : results[0];

                    return attributes;
                })
            });
        },

        _refreshValues: function (attributes) {

            ////////////////////

            var model = this.model;

            ////////////////////

            attributes = _.keys(attributes);
            attributes = _.pick(model.attributes, attributes);

            ////////////////////

            model.set(attributes);
        },

        _formatValue: function (value, attribute, attributes) {
            var options = this.attributes[attribute] || {}, getter = options.getter;

            return getter ? getter.call(this, attribute, value) : attributes[attribute];
        },

        _parseValue: function (value, attribute, attributes) {
            var options = this.attributes[attribute] || {}, setter = options.setter;

            return setter ? setter.call(this, attribute, value) : _.pick(attributes, attribute);
        },

        _pickDefaultValue: function (attribute) {

            ////////////////////

            var model = this.model;

            ////////////////////

            var defaultValue, defaults = _.result(model, 'defaults') || {};

            defaultValue = defaults[attribute];

            if (_.isUndefined(defaultValue)) {
                defaultValue = null;
            }

            return defaultValue;
        }
    });
}());
