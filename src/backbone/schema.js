/*jshint maxstatements:12, maxlen:101 */
(function (self) {
    'use strict';

    var Schema = Backbone.Schema = function (model) {

        ////////////////////

        if (!(this instanceof Schema)) {
            return new Schema(model);
        }

        ////////////////////

        self = _.extend(this, { model: model }, {
            handlers: {}
        });

        ////////////////////

        _.extend(model, {
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

                var getter = (self.handlers[attribute] || {}).getter;

                ////////////////////

                var value = fn.call(this, attribute);

                return getter ? getter(attribute, value) : this.attributes[attribute];
            }),

            set: _.wrap(model.set, function (fn, key, value, options) {

                ////////////////////

                var attributes;

                if (!key || _.isObject(key)) {
                    attributes = key;
                    options = value;
                } else {
                    (attributes = {})[key] = value;
                }

                ////////////////////

                var result = {};

                _.each(attributes, function (value, attribute, attributes) {

                    ////////////////////

                    var setter = (self.handlers[attribute] || {}).setter;

                    ////////////////////

                    var hash =  setter ? setter(attribute, value) : _.pick(attributes, attribute);

                    _.each(hash, function (value, key) {
                        result[key] = value;
                    });
                });

                return fn.call(this, result, options);
            })
        });
    };

    _.extend(Schema, {
        handlers: {
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

                    return Globalize.parseFloat(value, culture) || Number(value);
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

                    var Model, source = options.source, reset = options.reset;

                    Model = options.model || source.model;

                    options = _.extend({
                        parse: true,
                        silent: false
                    }, options);

                    ////////////////////

                    var model = this.get(attribute), attributes = source ? source.get(value) : value;

                    if (attributes instanceof Model) {
                        model = attributes;
                    } else if (model instanceof Model) {
                        if (reset !== false) {
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

                    var Collection, source = options.source, reset = options.reset;

                    Collection = options.collection || source.constructor;

                    options = _.extend({
                        parse: true,
                        silent: false
                    }, options);

                    ////////////////////

                    var collection = this.get(attribute),

                        models = source ? source.filter(function (model) {
                            return _.contains(value, model.id);
                        }) : value;

                    if (collection instanceof Collection) {
                        if (reset !== false) {
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

                ////////////////////

                options = options || {};

                ////////////////////

                this._addHandlers(attribute, options);
            }, this);

            this.refresh();

            return this;
        },

        refresh: function () {

            ////////////////////

            var handlers = this.handlers, attributes = {};

            _.each(handlers, function (options, attribute) {
                attributes[attribute] = this.model.attributes[attribute];
            }, this);

            ////////////////////

            this.model.set(attributes);

            return this;
        },

        defaultValue: function (attribute) {
            var defaults = _.result(this.model, 'defaults') || {};

            return _.has(defaults, attribute) ? defaults[attribute] : null;
        },

        _addHandlers: function (attribute, options) {

            ////////////////////

            var type = options.type, array = options.array,
                model = options.model, collection = options.collection;

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

            var callbacks = this.constructor.handlers[type] || {};

            ////////////////////

            this.handlers[attribute] = _.defaults(options, {
                getter: _.wrap(callbacks.getter, function (fn, attribute, value) {
                    var results = [], values = array ? value : [value];

                    _.each(values, function (value) {
                        var result;

                        if (_.isNull(value)) {
                            result = value;
                        } else {
                            result = fn ? fn.call(this, attribute, value, options) : value;
                        }

                        results.push(result);
                    }, this);

                    return array ? results : results[0];
                }),

                setter: _.wrap(callbacks.setter, function (fn, attribute, value) {
                    var results = [], values = array ? value : [value];

                    _.each(values, function (value) {

                        ////////////////////

                        if (_.isUndefined(value)) {
                            value = self.defaultValue(attribute);
                        }

                        ////////////////////

                        var result;

                        if (_.isNull(value)) {
                            switch (type) {
                            case 'model':
                                result = fn ? fn.call(this, attribute, {}, options) : value;
                                break;
                            case 'collection':
                                result = fn ? fn.call(this, attribute, [], options) : value;
                                break;
                            default:
                                result = value;
                                break;
                            }
                        } else {
                            result = fn ? fn.call(this, attribute, value, options) : value;
                        }

                        results.push(result);
                    }, this);

                    return _.object([attribute], [array ? results : results[0]]);
                })
            });

            this._bindCallbacks(options);
        },

        _bindCallbacks: function (options) {

            ////////////////////

            var getter = options.getter, setter = options.setter;

            ////////////////////

            var model = this.model;

            if (getter) options.getter = _.bind(getter, model);
            if (setter) options.setter = _.bind(setter, model);
        }
    });
}());
