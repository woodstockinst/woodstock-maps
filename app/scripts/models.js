/*global app, Backbone*/

app.Models = app.Models || {};

(function () {
    'use strict';

    app.MapModel = Backbone.Model.extend({

        initialize: function(){},

        validate: function(attrs, options) {},

        parse: function(response, options)  {
            return response;
        }
    });

})();
