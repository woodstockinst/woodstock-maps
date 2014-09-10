/*global app, Backbone, JST*/

app.Views = app.Views || {};

(function () {
    'use strict';

    var firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

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

    function getNumberFn() {
        switch (app.config.years().type) {
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

    function getIntersect(point, geoms) {
        var inside = false,
            x = point[0],
            y = point[1],
            vs, k, kk,
            xi, yi, xj, yj, intersect;

        k = 0; kk = geoms.length;
        for(; k < kk; ++k) {
            vs = geoms[k].geometry.coordinates[0];
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                xi = vs[i][0];
                yi = vs[i][1];
                xj = vs[j][0];
                yj = vs[j][1];

                intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            if (inside) {
                return geoms[k].properties;
            }
        }
        return false;
    };

    var $this = {};

    app.GraphPaneView = Backbone.View.extend({

        el: '#graph-pane',
        collection: app.graphData,
        events: {
            'click #close-graph-pane': 'close'
        },

        initialize: function() {
            this.listenTo(this.collection, 'open', this.open);
            this.listenTo(this.collection, 'close', this.close);
            this.listenTo(this.collection, 'updated', this.update);

            // Since we don't have to programmatically determine graph view, just render once
            //this.listenTo(app.mapData, 'reset', this.render);
            this.listenTo(app.mapData, 'change:complete', this.reset);
            this.$title = this.$('#graph-title');
            this.title = ' Vacancy';
            this.$content = this.$('#graph-content');
            this.$legend = $('.info .legend');
            // this.view is used for programmatically determining graph view
            this.view = '';
            this.render();
        },

        render: function() {
            var that = this;

            // line charts
            var charts = app.config.graphs;
            _.each([charts[0], charts[1]], function(graph, i) {
                new app.GraphViews.MedianChart(_.extend({
                    el: that.$content.find('#median-graph-' + (i+1)),
                    // hack to make the first name appear but not the second
                    tractName: i - 1
                }, graph))
            });

            _.each([charts[2], charts[3]], function(graph, i) {
                new app.GraphViews.MedianNumber(_.extend({
                    el: $('#numeric-' + (i+1)),
                    animate: false
                }, graph));
            });

        },

        // right now this simply closes the panel
        reset: function() {
            this.close();
        },

        update: function(tractData) {
            // keep a referece to tractData to pass onto new views
            // important when the map changes and the graph view stays open
            // NOTE: panel now closes on map view reset, so this is no longer necessary.
            //this.tractData = tractData;
            this.updateTitle(tractData.name);
        },

        updateTitle: function(name) {
            if (app.config.state.locale === 'census_tract') this.$title.text('Tract ' + name + this.title);
            else this.$title.text(name + this.title);
        },

        isOpen: false,
        open: function() {
            if (!this.isOpen) this.slideUp();
            $('#open-graph').hide();
            $('#close-graph').show();
        },

        close: function(){
            if(this.isOpen) this.slideDown();
            $('#close-graph').hide();
            $('#open-graph').show();
        },

        slideUp: function() {
            this.$el.addClass('slide-up');
            this.$legend.hide();
            this.isOpen = true;
        },

        slideDown: function() {
            this.$el.removeClass('slide-up');
            this.$legend.show();
            this.isOpen = false;
        },

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        // these are methods that currently aren't being used,
        // but are useful if we need to programatically decide which
        // graph views to employ
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        views: {
            'NumberCompare': ['employment', 'income', 'jobs'],
            'MedianChart': ['housing', 'mortgage'],
        },

        translate: function(subject) {
            switch (subject) {
                case 'income':
                case 'employment':
                case 'jobs':
                    return 'NumberCompare';
                    break;
                case 'mortgage':
                case 'housing':
                    return 'MedianChart';
                    break;
            }
        },

        // runs on map change
        rerender: function() {
            var subject = app.config.state.subject,
                metric = app.config.state.metric,
                name = this.tractData ? this.tractData.name : 'Tract';

            this.isTract = app.config.state.locale === 'census_tract' ? 1 : 0;

            // map has changed to a different year,
            // but still on the same metric and same subject;
            // do nothing.
            if (this.subject === subject &&
                this.metric === metric) return;

            // there is no view, or the view has to change;
            // wipe original child view, load new view with current tract data
            if (!this.view || this.views[this.view].indexOf(subject) === -1) {
                this.view = this.translate(subject);
                if (this.child) this.child.destroy();
                this.child = new app.GraphViews[this.view]({
                    el: this.$content,
                    tractData: this.tractData
                });
            }

            // either the metric or subject has changed,
            // but the same template will suffice; reset
            // median and year data, and update
            else {
                this.child.reset();
            }

            this.metric = metric;
            this.subject = subject;

            switch (subject) {
                case 'mortgage':
                case 'housing':
                    this.title = ' ' + app.human_metrics[app.config.state.metric];
                    break;
                case 'income':
                case 'employment':
                case 'jobs':
                    this.title = ' ' + subject.charAt(0).toUpperCase() + subject.slice(1);
                    break;
                default:
                    this.title = ' Metrics';
                    break;
            }

            this.updateTitle(name);
        }
    });

    app.LegendSelector = Backbone.View.extend({
        el: '#quintile-wrap',
        collection: app.mapData,
        events: {
            'click .quintile-legend': 'filter',
            'click #clear-quintile': 'clear'
        },
        initialize: function() {
            this.$clear = this.$('#clear-quintile');
            this.listenTo(this.collection, 'reset', this.hideClear);
            this.listenTo(this.collection, 'filtered:geometry', this.hideClear);
        },

        selections: [],

        filter: function(e) {
            console.log('in filter');
            e.preventDefault();
            var $this = $(e.currentTarget),
                n = $this.text(),
                i = this.selections.indexOf(n),
                quintiles = '';

            if ($this.hasClass('selected') && i !== -1) {
                this.selections.splice(i, 1);
                $this.removeClass('selected');
            } else {
                this.selections.push(n);
                $this.addClass('selected');
            }

            if (!this.selections.length) {
                this.hideClear();
                this.reset();
            }
            else if (!this.clearShowing) {
                this.$clear.show();
                this.clearShowing = true;
            }

            this.$clear.show();

            // return a string combination of quintiles from 0-9.
            // does not support more than 10 quintiles
            if (this.selections.length) {
                _.each(this.selections, function(a) {
                    a = '' + (parseInt(a, 10) - 1);
                    quintiles += a;
                });
                app.config.inChange();
                app.mapData.filterOnQuintile(quintiles);

                // reset sublocale
                app.config.state.sublocale = '';
            }

            return false;
        },

        clearShowing: false,
        hideClear: function() {
            this.$('.selected').removeClass('selected');
            this.clearShowing = false;
            this.$clear.hide();
            this.selections = [];
        },

        clear: function(e) {
            e.preventDefault();
            this.hideClear();
            this.reset();
            return false;
        },

        reset: function() {
            app.config.inChange();
            this.collection.update();
        }

    });

    app.DropdownView = Backbone.View.extend({
        events: {
            'change': 'change'
        },
        initialize: function() {
            this.init();
        },

        init: function() {
            this.listenTo(app.config, 'reset:all', this.reset);
            this.listenTo(app.config, 'change:' + this.options.prop, this.sync);

            this.prop = this.options.prop;
            this.$elm = $(this.options.el);
            this.choices = _.map(this.options.options, function(opt) {
                return {opt: opt, lower: opt.split(' ').join('_').toLowerCase()};
            });

            this.render();
            this.toSelect = this.options.defaultSelection;
            if (this.toSelect !== -1) this.select(this.toSelect);
            this.update();
        },

        sync: function(prop) {
            if (this.$selected.attr('value') === prop) return;
            var i = 0, ii = this.choices.length;
            for (; i < ii; ++i) {
                if (this.choices[i].lower === prop) {
                    this.select(i);
                    return;
                }
            }
        },

        reset: function() {
            this.select(this.toSelect === -1 ? 0 : this.toSelect);
        },

        change: function() {
            this.$selected = this.$elm.find('option:selected')
            this.update();
            if (!this.silent) app.config.navigate({trigger:true});
            return;
        },

        select: function(i) {
            var target = this.$elm.find('option').eq(i);
            if (target.attr('selected') !== 'selected') {
                target.attr('selected', 'selected');
                this.$selected = target;
            }
            return;
        },

        update: function() {
            app.config.update(this.prop, this.$selected.attr('value'));
        },

        render: function() {
            var template = this.template,

                html = _.map(this.choices, function(choice) {
                    if (choice.opt === 'Cbsa') {choice.opt = choice.opt.toUpperCase();}
                    return template(choice);
                });
            if (html) this.$elm.html(html.join());
        },

        template: _.template('<option value="<%= lower %>"><%= opt %></option>')
    });

    // year dropdown gets it's own class, it's the only one that has to update
    app.DynamoDropdownView = app.DropdownView.extend({
        initialize: function() {
            this.listenTo(app.config, 'reset:' + this.options.prop, this.reflow);
            this.init();
        },
        reflow: function(choices) {
            this.choices = _.map(choices, function(c) {
                return {opt: c.opt, lower: c.lower}
            });
            this.render();
            this.toSelect = this.toSelect > choices.length - 1 ? 0 : this.toSelect;
            this.select(this.toSelect);
            this.update();
        }
    });

    app.ParentSelector = Backbone.View.extend({

        el: '#universe',
        events: {
            'change': 'select'
        },
        template: _.template('<option value="<%= val %>"><%= text %></option>'),
        initialize: function() {
            // when popup closes, remove this view
            var kill = $.proxy(this.kill, this);
            app.map.once('popupclose', kill);
            this.render();
        },

        render: function() {
            var template = this.template;
            this.$el.html(_.map(this.options.selects, function(select) {
                return template({
                    text: select,
                    val: select.toLowerCase().split(' ').join('_')
                })
            }).join(''));

            // if we're already on a sub-locale, select it
            if (app.config.state.sublocale) {
                this.$('option').each(function() {
                    $this = $(this);
                    if ($this.attr('value') == app.config.state.sublocale) {
                        $this.attr('selected', true);
                    }
                });
            }
        },

        select: function(e) {
            var sublocale = this.$('option:selected').attr('value');

            if (sublocale === 'state_of_illinois') {
                app.config.update('sublocale', '');
                app.mapData.reset();
            }

            else {
                app.config.update('sublocale', sublocale);
                app.mapData.filter(this.options.tractId, sublocale);
            }
        },
        kill: function() {
            this.unbind();
            this.remove();
        }
    });

    app.SidebarView = Backbone.View.extend({
    	el: "#map-switch",
        events: {
            'click a': 'toggle'
        },
    	template: _.template("<li><a href='#' data-value='<%= mapid %>' class='button radius'><%= map %></a></li>"),
        target: {},
    	initialize: function(){
            this.listenTo(app.config, 'change:subject', this.render);
            this.$list = this.$('ul');
            this.render();
    	},

    	render: function(){
            var maps = _.map(app.config.maps(), this.renderOne, this);

            // clear the element and add in metrics one by one
            this.clear();
            this.animateIn(maps);

            // set the first map as default active
            this.target = this.$('li').eq(0).find('a');
            this.target.addClass('active');

            // update config collection
            this.update();
        },
        renderOne: function(map) {
            return $(this.template(map));
        },
        animateIn: function(els) {
            // this function opens up some cool animation options
            var i = 0, ii = els.length;
            for (; i < ii; ++i) {
                this.$list.append(els[i])
                els[i].fadeIn(200);
            }
        },
        clear: function() {
            this.$list.find('li').remove();
        },
        toggle: function(e) {
            e.preventDefault();
            this.newTarget = $(e.currentTarget);
            if (!this.newTarget.hasClass('active')) {
                this.target.removeClass('active');
                this.target = this.newTarget;
                this.target.addClass('active');
                this.update();
                app.config.navigate({trigger:true});
            }
            return false;
        },

        update: function() {
            app.config.update('metric', this.target.attr('data-value'));
        }
    });

    app.MapView = Backbone.View.extend({

        el: '#map',
        collection: app.mapData,
        events: {
            'click #open-graph': 'openGraph',
            'click #close-graph': 'closeGraph',
        },
    	initialize: function(){
            app.map = app.map || L.mapbox.map('map', this.options.basemap).setView([41.671, -88.899], 8);

            if (app.screenWidth < 641) {
                app.map.scrollWheelZoom.disable();
                app.map.setZoom(5)
            };

            app.map.addControl(L.mapbox.geocoderControl(this.options.basemap));
            app.map.whenReady(this.declare, this);

            app.geocoder = $('.leaflet-control-mapbox-geocoder-toggle.mapbox-icon.mapbox-icon-geocoder');
            app.geocoder.attr('id','geocoder');

            // When we get new geography and or new quintile data
            this.listenTo(this.collection, 'reset', this.render);
            // When we get a new subset of quintile data or geometry
            this.listenTo(this.collection, 'filtered:quintile', this.update);
            this.listenTo(this.collection, 'filtered:geometry', this.update);

            this.listenTo(this.collection, 'boundary:loaded', this.addBoundary);
            this.listenTo(this.collection, 'boundary:remove', this.clearBoundary);

            // loading gif initiates with map
            this.spinner = new Spinner({
                color: '#888',
                length:2,
                speed:0.8
            }).spin(document.getElementById('loader'));

    	},
        openGraph: function() {
            app.graphData.open();
        },
        closeGraph: function() {
            app.graphData.close();
        },

        isReady: false,
        needsRender: false,

        projection: function(pt) {
            var layerPoint = app.map.latLngToLayerPoint(new L.LatLng(pt[1], pt[0]));
            return [layerPoint.x, layerPoint.y]
        },

        declare: function() {
            this.isReady = true;

            var container = this.container = d3.select(app.map.getPanes().overlayPane);
            this.path = d3.geo.path().projection(this.projection);
            this.drag = d3.behavior.drag();
            this.pop = L.popup({closeOnClick: false, autoPan: false});

            var reset = $.proxy(this.reset, this),
                // map is not zooming, map is zoomed
                zooming = false,
                zoomed = true,
                delayed = false,
                delay;

            app.map.on('viewreset', function() {
                if (delayed) return;
                delayed = true;
                delay = setInterval(function() {
                    if (zoomed) {
                        clearInterval(delay);
                        delayed = false;
                        reset();
                    }
                }, 10);
            });

            app.map.on('zoomstart', function() {
                // close popup on zoom
                this.closePopup();
                // map is zooming, has not finished zooming
                zooming = true;
                zoomed = false;
                // during zoom, hide the container so we don't get weird shadows
                container.style('display', 'none');
            });

            app.map.on('zoomend', function() {
                // we finished zooming, but will we zoom again?
                // wait a bit and see, young readers.
                zooming = false;
                window.setTimeout(function() { if (!zooming) zoomed = true; }, 125); // 125 is scientifically optimum, trust me.
            });

            if (firefox) {
                this.$pane = $('.leaflet-map-pane').eq(0);
                this.transform = [0,0];
                var getTransform = $.proxy(this.getTransform, this);
                app.map.on('moveend', getTransform);
            }


            // If we tried to render the map before tiles are ready, render the map now
            if (this.needsRender) this.render(this.data);
        },

        getTransform: function() {
            var transform = this.$pane.css('transform');
            transform = transform.slice(transform.indexOf('(') + 1, transform.indexOf(')')).split(', ');

            this.transform = [
                parseInt(transform[4], 10),
                parseInt(transform[5], 10)
            ];
        },

        reset: function() {
            if (!this.features) return;

            var bounds = d3.geo.bounds(this.features),
                bottomLeft = this.projection(bounds[0]),
                topRight = this.projection(bounds[1]);

            this.svg.attr('width', topRight[0] - bottomLeft[0])
                .attr('height', bottomLeft[1] - topRight[1])
                .style('margin-left', bottomLeft[0] + 'px')
                .style('margin-top', topRight[1] + 'px');

            this.g.attr('transform', "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
            this.paths.attr('d', this.path);

            // if boundary exists, update it's paths
            if (this.boundary) this.boundary.attr('d', this.path);

            this.container.style('display', 'block');
            this.collection.onComplete();
        },

        // reset the map
        wipe: function() {
            // reset boundaries
            this.boundary = false;

            // remove the parent svg entirely and re-append
            // TODO remove just the paths we need to instead of wiping out the entire container
            this.container.select('svg').remove();
            this.svg = this.container.append('svg:svg');

            // if we've applied a fade for congressional boundaries, keep that class active
            var faded = this.isFaded ? ' faded-paths' : '';
            this.g = this.svg.append('svg:g').attr('class', 'leaflet-zoom-hide' + faded)
                .call(this.drag);
        },

        // called on updates, not filters
        render: function(data) {
            this.data = data;
            // if map variables come before tiles are finished loading, wait for the tiles
            if (!this.isReady) {
                this.needsRender = true;
                return
            }

            // see how data joins with topojson in http://bl.ocks.org/mbostock/4060606
            this.features = data.topo;

            // reset the map
            this.wipe();

            // update map colors. not a filter, so don't zoom to bounds
            this.draw(data, false);
        },

        // called on filters
        update: function(data) {
            // reset the map
            this.wipe();

            // update map colors. is a filter, so zoom to calculated bounds
            this.draw(data, true);
        },

        draw: function(data, isFilter) {
            var ids = data.numerical,
                pop = this.pop,

                // to calculate mouse position on click
                coords = [],

                // uses metric state to set function that parses popup value
                numberFn = getNumberFn(),

                that = this,

                // each row of data placeholder
                row = {},

                // variable to hold boundary data should we need it
                boundary = false,

                // variable to hold selections for parent selector should we need it
                selects = false,

                // filtering data to include only those we're showing
                features = this.features.features,
                ii = features.length,
                filteredFeatures = [],

                // throttling click, so we don't kill double-click zooming
                timer;

            // only feed d3 the paths that we are drawing
            for(var i = 0; i < ii; ++i) {
                row = ids.get(features[i].id);
                if (row) {
                    filteredFeatures.push(features[i]);
                }
            }

            this.paths = this.g.selectAll('.path')
                .data(filteredFeatures)
            .enter().append('path')
                .attr('class', function(d) {
                    return 'path quintile-' + ids.get(d.id).quintile;
                })
                // event handler for popup
                .on('click', function(d) {
                    // if in drag, or if there's no data, do nothing
                    if (d3.event.defaultPrevented || !ids.get(d.id)) return false;

                    // TODO double-click throttle is a bit buggy to respond when zooming several layers consecutively.
                    // if double-clicking, don't do anything (zooms)
                    else if (timer) {
                        clearTimeout(timer);
                        timer = null;
                        return false;
                    }

                    if (firefox) {
                        coords = d3.mouse(this);
                        coords = app.map.layerPointToLatLng([coords[0] - that.transform[0], coords[1] - that.transform[1]]);
                    } else {
                        coords = app.map.layerPointToLatLng(d3.mouse(this));
                    }

                    // there is a boundary active; find it's point of intersection
                    if (that.boundaryData) {
                        boundary = getIntersect([coords.lng, coords.lat], that.boundaryData);
                    }
                    else {
                        boundary = false;
                    }


                    // if there is a cbsa (meaning county) and it's cbsa 99, don't show a comparison
                    if (d.properties.cbsa && d.properties.cbsa === '99') selects = false;
                    // if we're on census tract or county, then we will have a parent universe
                    // if not, this returns false
                    else selects = app.config.parentUniverse();

                    timer = setTimeout(function() {
                        timer = null;
                        row = ids.get(d.id);
                        pop.setLatLng(coords);
                        if (row.quintile == 'na') {
                            pop.setContent('<h3>' + (row.name || 'Tract ' + row.id) + '</h3><p>Data not available</p>');
                        } else {
                            pop.setContent(that.template({
                                  name: row.name || 'Tract ' + row.id,
                                  value: numberFn(row.value),
                                  plus_quintile: row.quintile + 1,
                                  metric: app.config.metricName(),
                                  boundary: boundary,
                                  selects: selects
                              }))
                        }
                        pop.openOn(app.map);

                        // Create a new parent selector view, feeding it the target ID
                        if (selects) {

                            selects = {
                                selects: selects,
                                selected: row.quintile
                            };

                            // If we're on county, feed it the CBSA id that's attached to topojson props
                            // Otherwise, we filter on first 5 chars of census tract fips id.
                            selects.tractId = app.config.state.locale === 'county' ?
                                d.properties.cbsa : row.id;

                            app.parents = new app.ParentSelector(selects);
                        }

                        // Center the map using d3.geo
                        app.map.setView([coords.lat, coords.lng]);

                        // save the tract ID in case someone opens the graph pane
                        app.graphData.clickedOn(row.id);
                    }, 200);
                })
                .on('mouseover',function(){d3.select(this).style('cursor','pointer');})
                .on('mouseout',function(){d3.select(this).style('cursor','default');});

            this.reset();

            // if we've got a boundary, add it
            if (app.config.state.boundary !== 'no_boundary') this.collection.getBoundary();

            // if filtering, zoom to the filtered geography boundary
            // disabling this feature for client
            // if (isFilter) {
                // this.zoomToBounds(filteredFeatures);
            // }
        },
        zoomToBounds: function(features){
            var bounds =  d3.geo.bounds({type: 'FeatureCollection', features: features});
            app.map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]]);
        },
        // called on boundary dropdown change
        addBoundary: function(data) {
            if (this.boundary) this.removeBoundary();

            // insert a group before geography paths
            // this makes the tracts clickable
            var container = this.g.insert('g', ':first-child')
                .attr('class', 'boundary-container');

            // draw the boundary beneath the tracts
            // keep a reference so we can alter the paths on reset
            this.boundary = container.selectAll('.boundary')
                .data(data.features)
            .enter().append('path')
                .attr('class', 'boundary')
                .attr('d', this.path);

            // save a pointer to boundary data so we can reference it on click
            this.boundaryData = data.features;

            // fade out the tracts so we can see boundaries better
            this.fadePaths();
            this.collection.onComplete();
        },

        // called when boundary dropdown === no boundary
        clearBoundary: function() {
            this.removeBoundary();
            this.unFadePaths();
            this.collection.onComplete();
        },

        // remove boundary
        removeBoundary: function() {
            this.g.select('.boundary-container').remove();
            this.boundary = false;
            this.boundaryData = false;
        },

        // only fade the tracts if they're not yet faded
        // so we don't waste cycles when going from one boundary to another
        fadePaths: function() {
            if (!this.isFaded) {
                this.g.attr('class', 'leaflet-zoom-hide faded-paths');
                this.isFaded = true;
            }
        },

        // this should only be called when fade has been applied,
        // so no need to check if it's there, just reset the fade class
        unFadePaths: function() {
            this.g.attr('class', 'leaflet-zoom-hide');
            this.isFaded = false;
        },

        template: _.template($('#popup-template').html())
    });

    app.LoadingIndicator = Backbone.View.extend({

        initialize: function() {
            this.listenToOnce(app.mapData, 'reset', this.activate);
        },

        activate: function() {
            this.listenTo(app.config, 'change:change', this.show);
            this.listenTo(app.mapData, 'change:complete', this.hide);

            app.map.on('zoomstart',this.show);
            app.map.on('zoomend',this.hide);
        },

        show: function() {
            $('#loader').show();
        },

        hide: function() {
            $('#loader').hide();
        }

    });


    app.CSV = Backbone.View.extend({

        el: '#csv-container',
        template: _.template($('#csv-download-template').html()),
        events: { 'click .csv-download': 'download' },
        initialize: function() {
            var render = $.proxy(this.render, this);
            $('#csv-open').click(render);
        },

        render: function() {
            var template = this.template,
                subject = app.config.state.subject,
                locale = app.config.state.locale,
                metric = app.config.state.metric,
                filename = '',
                html,

            html = _.map(app.config.domain.year, function(year) {
                filename = [locale, metric, year + '.csv'].join('_');
                return template({
                    filename: filename,
                    locale: locale,
                    subject: subject,
                    metric: metric,
                    year: year
                });
            });

            this.$el.html(html.join(''));
        },

        download: function(e) {
            var $target = $(e.currentTarget),
                metric = $target.attr('data-metric'),
                year = $target.attr('data-year'),
                locale = $target.attr('data-locale'),
                path = ['data/maps', $target.attr('data-subject'), metric, locale, year + '.json']
                    .join('/'),
                that = this;
            d3.json(path, function(resp) {
                that.toCSV(resp, metric, year, locale);
            });
        },

        toCSV: function(data, metric, year, locale) {
            var csvList = [],
                header = data[0].length === 3 ? 'tract,tract-name,' : 'tract,' ,
                filename = [locale, metric, year + '.csv'].join('_');

            for(var i = 1, ii = data.length; i < ii;
                csvList.push(data[i].join(',')), ++i);
            var csvFile = year + ' ' + header + metric + '\n' + csvList.join('\n');

            var blob = new Blob([csvFile], { type: 'text/csv:charset=utf-8;' });
            if (navigator.msSaveBlob) { // ie 10+
                navigator.msSaveBlob(blob,  filename);
            } else {
                var link = document.createElement('a');
                if (link.download !== undefined) {
                    var url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style = 'visibility:hidden';
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    window.open(encodeURI('data:text/csv;charset=utf-8,', + csvFile));
                }
            }
        }
    });


    app.Legend = Backbone.View.extend({

        template: _.template($('#quintile-legend-template').html()),
        el: '#quintile-legend',
        collection: app.mapData,

        initialize: function() {
            // When we get new geography and or new quintile data
            this.listenTo(this.collection, 'reset', this.render);
            this.listenTo(this.collection, 'filtered:geometry', this.render);
        },

        render: function(data) {
            var numberFn = getNumberFn(),
                values = _.map(data.numerical.get('minmax'), function(value, key) {

                var rounded = _.map(value,function(num){ return d3.round(num,2);});
                return numberFn(rounded[0]) + ' - ' + numberFn(rounded[1]);
            });
            this.$el.html(this.template({values: values}));
        }

    });
})();
