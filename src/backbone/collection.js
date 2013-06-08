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
