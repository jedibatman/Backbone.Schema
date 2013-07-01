/*jshint maxstatements:12, maxlen:104 */
(function () {
    'use strict';

    var Schema = Backbone.Schema = function (model, options) {

        ////////////////////

        this.attributes = {};

        ////////////////////

        this.model = _.extend(model, {
            toJSON: _.wrap(model.toJSON, function (fn, options) {
                var attributes = fn.call(this, options);

                _.each(attributes, function (value, attribute, attributes) {

                    ////////////////////

                    if (value instanceof Backbone.Model) {
                        value = value.source ? value.id : value.toJSON(options);
                    } else if (value instanceof Backbone.Collection) {
                        value = value.source ? _.pluck(value.models, 'id') : value.toJSON(options);
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

        this.options = _.extend({}, options);
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

                    var format = options.format || 'n', culture = options.culture;

                    ////////////////////

                    return Globalize.format(value, format, culture);
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture;

                    ////////////////////

                    value = String(value);

                    ////////////////////

                    return Globalize.parseFloat(value, culture);
                }
            },

            datetime: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    var format = options.format || 'd', culture = options.culture;

                    ////////////////////

                    value = new Date(value);

                    ////////////////////

                    return Globalize.format(value, format, culture);
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var format = options.format || 'd', culture = options.culture,
                        standard = options.standard;

                    ////////////////////

                    value = Globalize.parseDate(value, format, culture) || new Date(value);

                    ////////////////////

                    var datetime;

                    switch (standard) {
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

                    ////////////////////

                    var culture = options.culture;

                    ////////////////////

                    return Globalize.localize(value, culture) || value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture;

                    ////////////////////

                    value = String(value);

                    ////////////////////

                    var match, messages = Globalize.findClosestCulture(culture).messages,

                        pairs = _.pairs(messages);

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

                    var Model = options.model, source = options.source, reset;

                    options = _.extend({
                        reset: true
                    }, {
                        parse: true,
                        silent: false
                    }, options);

                    reset = options.reset;

                    ////////////////////

                    var model = this.get(attribute), attributes = source ? source.get(value) : value;

                    if (attributes instanceof Model) {
                        model = attributes;
                    } else if (model instanceof Model) {
                        if (reset) {
                            model.clear().set(attributes, options);
                        } else {
                            model.set(attributes, options);
                        }
                    } else {
                        model = new Model(attributes, options);
                    }

                    model.source = source || null;

                    return model;
                }
            },

            collection: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var Collection = options.collection, source = options.source, reset;

                    options = _.extend({
                        reset: true
                    }, {
                        parse: true,
                        silent: false
                    }, options);

                    reset = options.reset;

                    ////////////////////

                    var collection = this.get(attribute),

                        models = source ? source.filter(function (model) {
                            return _.contains(value, model.id);
                        }) : value;

                    if (collection instanceof Collection) {
                        if (reset) {
                            collection.reset(models, options);
                        } else {
                            collection.set(models, options);
                        }
                    } else {
                        collection = new Collection(models, options);
                    }

                    collection.source = source || null;

                    return collection;
                }
            }
        }
    });

    _.extend(Schema.prototype, {
        constructor: Schema,

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
            var options = this.attributes[attribute] || {}, getter = options.getter;

            return getter ? getter(attribute, value) : attributes[attribute];
        },

        parseValue: function (value, attribute, attributes) {
            var options = this.attributes[attribute] || {}, setter = options.setter;

            return setter ? setter(attribute, value) : _.pick(attributes, attribute);
        },

        _addAttribute: function (attribute, options) {

            ////////////////////

            var type = options.type, array = options.array, model = options.model,
                collection = options.collection;

            if (!type) {
                if (array) {
                    type = array;
                } else if (model) {
                    type = 'model';
                } else if (collection) {
                    type = 'collection';
                }
            }

            ////////////////////

            var handlers = this.constructor.types[type],

                getter = handlers.getter,
                setter = handlers.setter;

            this.attributes[attribute] = _.defaults(options, {
                getter: _.wrap(getter, function (fn, attribute, value) {
                    var results, values = array ? value : [value];

                    results = _.map(values, function (value) {
                        return fn.call(this, attribute, value, options);
                    }, this);

                    return array ? results : results[0];
                }),

                setter: _.wrap(setter, function (fn, attribute, value) {
                    var attributes = {}, results = [], values = array ? value : [value];

                    _.each(values, function (value) {

                        ////////////////////

                        var schema = this.schema;

                        ////////////////////

                        value = _.isUndefined(value) ? schema.defaultValue(attribute) : value;

                        ////////////////////

                        var result = _.isNull(value) ? value : fn.call(this, attribute, value, options);

                        if (!array || !_.isNull(result) && !_.isUndefined(result)) {
                            results.push(result);
                        }
                    }, this);

                    attributes[attribute] = array ? results : results[0];

                    return attributes;
                })
            });

            this._bindHandlers(options);

            this.refreshValue(attribute, options);
        },

        _bindHandlers: function (options) {

            ////////////////////

            var model = this.model;

            ////////////////////

            var getter = options.getter, setter = options.setter;

            ////////////////////

            options.getter = getter ? _.bind(getter, model) : getter;
            options.setter = setter ? _.bind(setter, model) : setter;
        }
    });
}());
