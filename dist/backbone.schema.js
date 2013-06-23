/**
 * Backbone.Schema v0.3.3
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
                var value = fn.call(this, attribute), attributes = this.attributes;

                return this.schema.formatValue(value, attribute, attributes);
            }),

            set: _.wrap(model.set, function (fn, attribute, value, options) {
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
                    var values = this.schema.parseValue(value, attribute, attributes);

                    _.extend(processedAttributes, values);
                }, this);

                return fn.call(this, processedAttributes, options);
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

                    return Globalize.format(value, options.format);
                },

                setter: function (attribute, value) {

                    ////////////////////

                    value = String(value);

                    ////////////////////

                    return Globalize.parseFloat(value);
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

        _addAttribute: function (attribute, options) {

            ////////////////////

            var model = this.model;

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
                setter = processor.setter,

                value = model.attributes[attribute];

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

                        value = _.isUndefined(value) ? this.schema.defaultValue(attribute) : value;

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

            model.set(attribute, value);
        }
    });
}());
