/*global app, Backbone*/

app.Routers = app.Routers || {};

(function () {
    'use strict';
   	app.Router = Backbone.Router.extend({
            routes: {
                ':subject/:locale/:metric/:year': 'render',
                ':subject/:locale/:metric'      : 'render',
                ':subject/:locale'              : 'render',
                ':subject'                      : 'render',

                ''                              : 'start'
            },

            render: function(subject, locale, metric, year) {
                app.config.setState(subject, locale, metric, year);
            },

            start: function() {
                app.config.navigate({trigger:true});
            }
        })
})();
