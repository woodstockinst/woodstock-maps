/*global woodstock, $*/

window.app = {
    addDataValue: function(elArray){
        _.each(elArray,function(el){
            $(el).attr('data-value',$(el).html().replace('.','').split(' ').join('_').toLowerCase());
        })
    },
    init: function(config){
        'use strict';

        app.config = new app.ConfigCollection();
        app.config.init(config);

        app.router = new app.Router;
        Backbone.history.start();
    },

    template: function(id, file, data, callback) {
        var data = data || {};

        // element does not exist
        if (!document.getElementById(id + '-template')) {
            $.get(file, function(response) {
                $('#templates').append(
                    '<div id="' + id + '-template">' +
                        _(response).template(data) +
                    '</div>'
                );
                if (callback && _.isFunction(callback)) callback();
            });
        }

        // element does exist, call the callback
        else {
            if (callback && _.isFunction(callback)) callback();
        }
    },

    human_metrics: {
        // housing metrics
        pct_vacant: 'percent vacancy',
        pct_change: 'change in percent vacancy',
        // pct_owner_occupied: '',

        // mortgage metrics
        pct_owner_occupied: 'percent for owner-occupied',
        pct_originated: 'percent originated',
        pct_conventional: 'percent conventional loans',
        avg_amount: 'average mortgage amount'
    }
};


$(document).ready(function () {
  'use strict';
  queue().defer(d3.json, 'data/config.json', app.init);
});
