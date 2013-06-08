$(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Model = Backbone.Model, Collection = Backbone.Collection;

    ////////////
    // MODULE //
    ////////////

    module('Backbone.Collection (Schema)', {
        setup: function () {
            this.collection = new Collection();
        }
    });

    ///////////
    // TESTS //
    ///////////

    test('model', function () {
        strictEqual(this.collection.model, Model);
    });
});
