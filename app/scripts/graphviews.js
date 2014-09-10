/*global app, Backbone, JST*/
app.GraphViews = app.GraphViews || {};

(function () {
    'use strict';

    // Utility function to parse text and numbers
    function comma(s) {
        return '$' + s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function pct(s) {
        return s + '%';
    }

    function number(s) {
        return s > 1000 ? s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : s;
    }

    function getNumberFn(type) {
        switch (type) {
            case 'currency':
                return comma;
                break;
            case 'percent':
                return pct;
                break;
            case 'number':
                return number;
                break;
        }
    }

    // View that knows how to take care of itself
    var Destroyer = Backbone.View.extend({
        destroy: function() {
            // remove each of the view's children views
            if (this.children) _.each(this.children,
                                      function(child) { child.destroy(); });
            // empty the element and remove the view
            this.$el.empty();
            this.stopListening();
        }
    });

    var LineChart = Destroyer.extend({
        initialize: function() {
            var opts = this.options,
                that = this;

            this.$el = $(opts.el);

            this.svg = d3.select(opts.el).append('svg:svg')
                .attr('width', opts.width + opts.margin.left + opts.margin.right)
                .attr('height', opts.height + opts.margin.top + opts.margin.bottom)
              .append('g')
                .attr('class', 'line-chart')
                .attr('transform', 'translate(' + opts.margin.left + ',' + opts.margin.top + ')');

            this.x = d3.scale.linear()
                .range([0, opts.width]);

            this.y = d3.scale.linear()
                .range([opts.height, 0]);

            this.line = d3.svg.line()
                .x(function(d) { return that.x(d.x); })
                .y(function(d) { return that.y(d.val); });

            this.path1 = this.svg.append('path')
                .attr('class', 'path-light');

            this.path2 = this.svg.append('path')
                .attr('class', 'path-dark');

            this.parse = getNumberFn(this.options.type);

            if (opts.ticks) {

                this.svg.append('text')
                    .attr('y', opts.height)
                    .attr('x', '-1em')
                    .text('0');

                this.text = [];
                this.text.push(
                    this.svg.append('text')
                        .attr('y', opts.height)
                        .attr('dy', '1.4em')
                        .attr('class', 'text-start')
                    ,this.svg.append('text')
                        .attr('y', opts.height)
                        .attr('dy', '1.4em')
                        .attr('x', opts.width)
                    ,this.svg.append('text')
                        .attr('y', 0)
                        .attr('dy', '0.75em')
                        .attr('x', '-1em')
                );
            }
        },

        update: function(d, y, m) {
            var medians = m || [],
                ends = [
                    y[0],
                    y[y.length-1],
                    this.pretty(d3.max(d.concat(medians), function(d) { return d.val }))
                ],
                that = this;

            this.x.domain([ends[0], ends[1]]);
            this.y.domain([0, ends[2]]);

            ends[2] = this.parse(ends[2]);

            if (this.options.ticks) {
                _.each(this.text, function(text, i) {
                    text.text(ends[i]);
                });
            }

            if (this.options.markers) {

                var markers = this.svg.selectAll('.year-marker')
                    .data(d);

                markers.exit().remove();

                markers.enter().append('circle')
                    .attr('cx', function(d) { return that.x(d.x) })
                    .attr('cy', this.options.height)
                    .attr('class', 'year-marker')
                    .attr('fill', function(d) { return d.x === +app.year ? '#9e0142' : '#fefefe' })
                    .attr('r', 4)

                    // for creating a tooltip
                    // .on('mouseover', function(d) { })
                    ;

                markers.transition()
                    .delay(200)
                    .attr('cy', function(d) { return that.y(d.val) })
                    .attr('cx', function(d) { return that.x(d.x) });
            }

            // if medians, draw both lines and add markers
            // otherwise, just draw the ligher line
            if (medians.length) {

                this.path1.datum(medians)
                    .transition()
                    .delay(200)
                    .attr('d', this.line);

                this.path2.datum(d)
                    .transition()
                    .delay(200)
                    .attr('d', this.line);
            }

            else {
                this.path2.datum(d)
                    .transition()
                    .delay(200)
                    .attr('d', this.line);
            }
        },

        pretty: function(n) {
            var a = Math.ceil(n);
            return a + 5 - (a % 5)
        },
    });

    // contains basic boilerplate for loading templates and getting env vars
    var Base = Destroyer.extend({
        collection: app.graphData,
        id: '',
        initialize: function() {
            this.listenTo(this.collection, 'updated', this.update);
            this.$el = this.options.el;

            this.reset();

            if (this.init) this.init();
            if (this.templateUrl) {
                var render = $.proxy(this.render, this);
                app.template(this.id, this.templateUrl, {}, render);
            }
        },

        // set the variables to read from schema and tract data
        reset: function() {
            if (this.tractData) this.update(this.tractData);
        },

        templateUrl: '',
        render: function() {},
        update: function() {}
    });

    app.GraphViews.MedianNumber = Base.extend({
        init: function() {
            var opts = this.options;
            this.$el = opts.el;
            this.$value = this.$el.find('.num-value');
            this.$median = this.$el.find('.num-median');
            this.parse = getNumberFn(opts.type)

            this.$el.find('.label-value').text(opts.display);

            this.animate = opts.animate;
            if (this.animate) {
                this.$value.text('0');
                this.$median.text('0');
                this.lastn = 0;
                this.props = {};
                if (opts.type === 'currency') this.props.numberStep = $.animateNumber.numberStepFactories.separator(',')
                if (opts.suffix) this.props.numberStep = $.animateNumber.numberStepFactories.append(opts.suffix);
                if (opts.prefix) this.props.numberStep = $.animateNumber.numberStepFactories.append(opts.prefix);
            }

            this.render(this.$median, this.parse(this.options.medians[0]));
        },

        update: function(tractData) {
            var n = tractData[this.options.mapid] ? this.parse(tractData[this.options.mapid][0]) : 'n/a';
            this.render(this.$value, n);
        },

        render: function($el, n) {
            if (this.animate) {
                this.props.number = n;
                $el.prop('number', this.lastn).animateNumber(this.props);
                this.lastn = n;
            }
            else {
                $el.text(n);
            }
        },
    });

    app.GraphViews.MedianChart = Base.extend({
        id: 'median-chart',
        templateUrl: 'templates/graphs/median-chart.html',

        render: function() {
            var template = $('#' + this.id + '-template'),
                id = 'graph-' + this.options.subject;
            this.$el.html(template.html());

            // saving a reference to graph to watch out for screen size changes
            this.$title = this.$el.find('.graph-title');
            this.$graph = this.$el.find('.graph-body');
            this.$graph.attr('id', id);

            // start children views
            this.children = [];
            this.children.push(new LineChart({
                el: '#' + id,
                width: this.$graph.width() - 80,
                height: 120,
                margin: {
                    left: 75,
                    right: 5,
                    top: 5,
                    bottom: 25
                },
                type: this.options.type,
                ticks: true,
                markers: true
            }));

            if (!this.options.tractName) this.$title.text(this.options.display);
            if (this.options.tractData) this.update(this.options.tractData);
        },

        update: function(tractData) {
            this.tractData = tractData;

            var years = this.options.years,
                data = _.map(tractData[this.options.mapid], function(d, i) {
                    return {val: d, x: years[i]}
                }),
                medians = _.map(this.options.medians, function(d, i) {
                    return {val: d, x: years[i]}
                });

            this.children[0].update(data, years, medians);
            if (this.options.tractName) this.updateTitle(tractData.name);
        },

        updateTitle: function(name) {
            if (app.config.state.locale === 'census_tract') this.$title.text('Tract ' + name + this.options.display);
            else this.$title.text(name + this.options.display);
        },
    });
})();
