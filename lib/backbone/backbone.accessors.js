/*!
 * Backbone.Accessors v0.1.0
 * https://github.com/DreamTheater/Backbone.Accessors
 *
 * Copyright (c) 2013 Dmytro Nemoga
 * Released under the MIT license
 */
/*jshint forin:false, maxparams:4, maxlen:86, loopfunc:true */
(function () {
    'use strict';

    // Superclass
    var Model = Backbone.Model;

    /**
     * @class Backbone.Model
     */
    Backbone.Model = Model.extend({
        /**
         * @constructor
         */
        constructor: function () {

            /////////////////
            // DEFINITIONS //
            /////////////////

            this._getters = {};
            this._setters = {};

            /////////////////

            // Call parent constructor
            Model.apply(this, arguments);
        },

        addGetter: function (attribute, callback, context) {
            // Attribute getters
            var getters = this._getters[attribute] || [];

            // Add getter hash into list
            getters.push({
                callback: callback,
                context: context || this
            });

            // Overwrite getters list
            this._getters[attribute] = getters;

            return this;
        },

        addSetter: function (attribute, callback, context) {
            // Attribute setters
            var setters = this._setters[attribute] || [];

            // Add setter hash into list
            setters.push({
                callback: callback,
                context: context || this
            });

            // Overwrite setters list
            this._setters[attribute] = setters;

            return this;
        },

        get: _.wrap(Model.prototype.get, function (get, attribute) {
            // Original attribute value
            var value = get.call(this, attribute),

                // Attribute getters
                getters = this._getters[attribute];

            return _.reduce(getters, function (value, getter) {
                return getter.callback.call(getter.context, attribute, value);
            }, value);
        }),

        set: _.wrap(Model.prototype.set, function (set, key, value, options) {

            ///////////////////
            // NORMALIZATION //
            ///////////////////

            // Attributes hash
            var attributes;

            // Normalize arguments (attributes, options)
            if (_.isObject(key) || !key) {
                // Resolve attributes (clone hash to prevent unwanted changes)
                attributes = _.clone(key instanceof Model ? key.attributes : key);
                // Resolve options
                options = value;
            } else {
                // Resolve attributes
                (attributes = {})[key] = value;
            }

            ///////////////////

            for (var attribute in attributes) {
                // Attribute setters
                var setters = this._setters[attribute],

                    // Calculated attributes values
                    values = _.reduce(setters, function (attributes, setter) {
                        var value = attributes[attribute];

                        return setter.callback.call(setter.context, attribute, value);
                    }, attributes);

                // Extend original attributes with calculated values
                _.extend(attributes, values);
            }

            return set.call(this, attributes, options);
        }),

        toJSON: _.wrap(Model.prototype.toJSON, function (toJSON, options) {

            ///////////////
            // INSURANCE //
            ///////////////

            // Ensure options
            options = options || {};

            ///////////////

            // Original attributes hash
            var attributes = toJSON.call(this, options);

            if (options.parse) {
                // Insert values obtained with using getters
                for (var attribute in this._getters) {
                    attributes[attribute] = this.get(attribute);
                }
            }

            return attributes;
        })
    });
}());
