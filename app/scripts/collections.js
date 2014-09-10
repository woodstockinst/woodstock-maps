/*global app, Backbone*/

app.Collections = app.Collections || {};

(function () {
    'use strict';

    // function to filter tracts based on ID, using a list of ID as possible matches
    function filterTracts(tracts, ids) {
        var keys = tracts.keys() || [],
            filtered = [],
            i = 0, ii = keys.length,
            index = -1;
        for(; i < ii; ++i) {
            index = ids.indexOf(keys[i]);
            if (index !== -1) {
                filtered.push(tracts.get(keys[i]));
                // after finding an id, remove it from the list
                ids.splice(index, 1);
                // if we've found all the ids, break the loop
                if (!ids.length) return filtered;
            }
        }
        return filtered;
    }

    app.ConfigCollection =  Backbone.Collection.extend({

        // bootstrapping function; saves app meta data and possible queries.
        // initiates views
        init: function(config) {
            var i = 0,
                ii,
                j, jj,
                subject;

            // 8-12 bootstrapped config to contain graph data
            // this saves graph data, then re-assigns config so the rest of this script works as normal
            this.graphs = config.graphs;
            this.basemap = config.basemap;
            var config = config.schema;
            ii = config.length;

            this.state = {};
            this.config = config;

            // get the proper domains for our data, so that we can validate queries from URL
            this.domain = {}

            // year dropdown, which sets app.config.domain.year whenever year changes
            this.domain.year = [];
            new app.DynamoDropdownView({el: '#year-select', prop: 'year', options: this.domain.year, defaultSelection: 0});

            // locale dropdown. Like year dropdown, it's dynamic. Sets app.config.domain.locale
            //this.domain.locale = ['census_tract', 'county', 'cbsa', 'municipality'];
            //var locales = ['Census Tract', 'County', 'Cbsa', 'Municipality'];
            this.domain.locale = [];
            new app.DynamoDropdownView({el: '#locale-select', prop: 'locale', options: this.domain.locale, defaultSelection: 0});

            // recording possible options for subject, median, and schema for use later on
            this.domain.subject = [];
            this.schema = {};
            var metricLookup = {};
            for(; i < ii; ++i) {
                // when we feed subject to dropdowns, it needs to be upper-case for display
                subject = config[i].subject;
                this.domain.subject.push(subject);
                // convert subject to lower-case for switching environmental variables
                subject = subject.split(' ').join('_').toLowerCase();
                this.schema[subject] = config[i].schema;

                j = 0;
                jj = config[i].metrics.length;
                for(; j < jj; ++j) {
                    metricLookup[config[i].metrics[j].mapid] = config[i].metrics[j].map;
                }
            }
            this.metricLookup = metricLookup;

            // init subject dropdown. this sets app.config.state.subject whenever it changes
            new app.DropdownView({el: '#type-select', prop: 'subject', options: this.domain.subject, defaultSelection: 0});

            this.domain.metric = [];
            new app.SidebarView();

            this.domain.boundary = ['No Boundary', 'Congressional', 'State Senate', 'State House','Chicago Community Area'];
            new app.DropdownView({el: '#boundary-select', prop: 'boundary', options: this.domain.boundary, defaultSelection: 0, silent: 1});

            new app.GraphPaneView();
            new app.LegendSelector();
            new app.CSV();
            new app.Legend();

            app.loading = new app.LoadingIndicator();

            app.screenWidth = $(window).width();
            app.mapView = new app.MapView({basemap: this.basemap});
        },

        // called on route change
        setState: function(subject, locale, metric, year) {
            // no arguments at all, reset dropdowns and load default
            if (!subject) {
                this.trigger('reset:all');
                app.mapData.update();
                return;
            }

            else if (this.state.subject !== subject && this.inDomain('subject', subject)) {
                this.update('subject', subject);
            }

            if (locale && locale !== this.state.locale && this.inDomain('locale', locale)) {
                this.update('locale', locale);
            }

            if (metric && metric !== this.state.matric && this.inDomain('metric', metric)) {
                this.update('metric', metric);
            }

            if (year && year !== this.state.year && this.inDomain('year', year)) {
                this.update('year', year);
            }

            // No option to start with a sublocale or boundary
            this.update('sublocale', '');

            // if url query is not in domain or malformed, correct it
            // but don't trigger a reset
            this.navigate({trigger: false, replace: true});
            app.mapData.update();
        },

        inDomain: function(prop, val) {
            var i = 0,
                domain = this.domain[prop],
                ii = domain.length;
            for (; i < ii; ++i) {
                if (val === domain[i].toLowerCase()) {
                    return true
                }
            }
            return false;
        },

        // translate locale into topojson url & object property
        locateLocale: function(untranslated) {
            var locale = untranslated || this.state.locale,
                tractfiles = this.hasTractFiles();

            // when we need to load older census tracts
            if (locale === 'census_tract' && tractfiles !== undefined) {
                return 'il_tracts_' + tractfiles[this.state.year];
            }

            return locale === 'census_tract' ? 'il_tracts_2010' :
                        locale === 'county' ? 'il_counties' :
                        locale === 'municipality' ? 'il_places' :
                        locale === 'cbsa' ? 'il_cbsa' : '';
        },

        locateBoundary: function(boundary) {
            var boundary = boundary || this.state.boundary || '';
            return boundary === 'congressional' ? 'il_congressional' :
                        boundary === 'state_senate' ? 'PA_97-6_Senate_Districts' :
                        boundary === 'state_house' ? 'PA_97-6_House_Districts' :
                        boundary === 'chicago_community_area' ? 'il_chicago_community_area' : '';
        },

        parentUniverse: function(locale) {
            var locale = locale || this.state.locale;
            return locale === 'census_tract' ? ['State of Illinois', 'County'] :
                    locale === 'county' ? ['State of Illinois', 'CBSA'] : false;
        },

        // calculate and return index in schema for current subject and metric
        index: function() {
            return this.schema[this.state.subject].indexOf(this.state.metric);
        },

        metrics: function() {
            var subject = this.state.subject
            return _.find(this.config, function(config) {
                return config.subject.split(' ').join('_').toLowerCase() == subject;
            });
        },

        metricName: function() {
            return this.metricLookup[this.state.metric];
        },

        maps: function() {
            var metrics = this.metrics();
            return metrics.metrics
        },

        years: function() {
            var metrics = this.metrics(),
                metric = this.state.metric;
            return _.find(metrics.metrics, function(eachMetric) {
                return eachMetric.mapid === metric;
            });
        },

        setYears: function() {
            var years = this.years();
            if (!years) return;
            if (!this.domain.year.length || this.isDifferent(this.domain.year, years.years)) {
                this.domain.year = years.years;
                this.trigger('reset:year', _.map(years.years, function(y) {
                    return {opt: y, lower: y}
                }));
            }
            return;
        },

        setLocales: function() {
            var metrics = this.metrics();
            if (!this.domain.locale.length || this.isDifferent(this.domain.locale, metrics.locale)) {
                this.domain.locale = metrics.locale;
                this.trigger('reset:locale', _.map(metrics.locale, function(l) {
                    return {opt: l, lower: l.split(' ').join('_').toLowerCase()}
                }));
            }
        },

        hasTractFiles: function() {
            var metrics = this.metrics();
            if (metrics.tractfiles) {
                return metrics.tractfiles
            }
            else {
                return undefined;
            }
        },

        isDifferent: function(a, b) {
            var la = a.length,
                lb = b.length;
            if (la !== lb) {
                return true;
            } else {
                for(var i = 0, ii = la; i < ii; ++i) {
                    if (a[i] !== a[i]) return true;
                }
            }
            return false;
        },

        inChange: function() {
            this.trigger('change:change');
        },

        // core functionality of this collection
        update: function(prop, val) {
            // if it's the same, do nothing
            if (this.state[prop] === val) return;

            // record the value on app.config.state
            this.state[prop] = val;

            // trigger a general change event
            // this is for showing the loading indicator
            this.inChange();

            // trigger a specific change event
            switch (prop) {
                case 'year':
                    this.trigger('change:year', val);
                    break;
                case 'subject':
                    this.updateDomains();
                    this.setYears();
                    this.setLocales();
                    this.trigger('change:subject', val);
                    break;
                case 'locale':
                    this.trigger('change:locale', val);
                    break;
                case 'sublocale':
                    this.trigger('change:sublocale', val);
                    break;
                case 'boundary':
                    this.trigger('change:boundary', val);
                    app.mapData.getBoundary();
                    break;
                case 'metric':
                    this.setYears();
                    this.trigger('change:metric', val);
                    break;
            }
        },

        updateDomains: function() {
            var metrics = this.metrics(),
                i = 0,
                ii = metrics.length;
            this.domain.metric = [];
            for (; i < ii; ++i) {
                this.domain.metric.push(metrics[i].mapid);
            }
        },

        isReady: function(props) {
            var i = 0,
                ii = props.length;
            for (; i < ii; ++i) {
                if (!this.state[props[i]]) {
                    return false;
                }
            }
            return true;
        },

        navigate: function(opts) {
            var props = ['subject', 'locale', 'metric', 'year'],
                path = '';
            if (this.isReady(props)) {
                path = _.map(['subject', 'locale', 'metric', 'year'], function(prop) {
                    return app.config.state[prop];
                }).join('/');
                app.router.navigate(path, opts);
            }
        },
    });

    var MapData = Backbone.Collection.extend({
        initialize: function() {
            // number of quintiles to render
            this.quintiles = 5;
        },

        // hide loading indicator and close popups
        onComplete: function() {
            app.map.closePopup();
            this.trigger('change:complete');
        },

        quintileUrl: function() {
            var path = _.map(['subject', 'metric', 'locale', 'year'], function(prop) {
                return app.config.state[prop]
            }).join('/');
            return ['data', 'maps', path + '.json'].join('/')
        },

        geographyUrl: function() {
            return ['data', 'topojson', app.config.locateLocale() + '.json'].join('/')
        },

        parentGeographyUrl: function(locale) {
            return ['data', 'topojson', app.config.locateLocale(locale) + '.json'].join('/')
        },

        boundaryUrl: function(boundary) {
            return ['data', 'topojson', 'il_' + boundary + '.json'].join('/')
        },

        // we cache URL's before we cache data
        // this is for those rare cases when the url changes before our data loads
        // these two methods make sure we're always caching the right url to the right data
        cache: function(url, data) {
            this.models.push({url: url, data: data});
        },

        // checks if the url is cached, and if the data exists. if so, return it
        isCached: function(url) {
            var i = 0, ii = this.models.length;
            for (; i < ii; ++i) {
                if (this.models[i].url === url) {
                    return this.models[i].data
                }
            }
            return false;
        },

        reset: function() {
            var that = this,
                d = {
                    topo: this.isCached(this.geographyUrl()),
                    numerical: this.isCached(this.quintileUrl())
                };

            function reset() {
                that.trigger('filtered:geometry', d);
            }
            window.setTimeout(reset, 25);
        },

        update: function() {

            var geo = this.geographyUrl(),
                geoData = this.isCached(geo),
                num = this.quintileUrl(),
                numData = this.isCached(num),
                q = queue(),
                cache = $.proxy(this.cache, this),
                quintile = $.proxy(this.sortQuintile, this),
                that = this,
                waitLoad;

            if (!geoData) {
                // console.log('getting ', geo);
                q.defer(d3.json, geo);
            }
            if (!numData) {
                // console.log('getting ', num);
                q.defer(d3.json, num);
            }

            // if both are cached, debounce to show waiting indicator
            if (numData && geoData) {
                waitLoad = _.debounce(onLoad, 25);
                q.awaitAll(waitLoad);
            }
            else {
                q.awaitAll(onLoad);
            }

            function onLoad(err, resps) {
                if (err) {
                    // console.log(err);
                    return
                }
                else if (resps) {
                    _.each(resps, function(resp) {
                        // topojson, convert to geojson and then cache
                        if (resp.type && resp.type === 'Topology') {
                            resp = topojson.feature(resp, resp.objects[app.config.locateLocale()]);
                            //console.log(resp);
                            cache(geo, resp);
                            geoData = resp;
                        }
                        // data json, apply quintiles and cache the quintiled version
                        else {
                            resp = quintile(resp);
                            cache(num, resp);
                            numData = resp;
                        }
                    });
                }
                // reset the sublocale when updating geography and data
                app.subLocale = '';
                that.trigger('reset', {topo: geoData, numerical: numData});
            }
        },

        sortQuintile: function(d) {
            var header = d.shift();
            return this.addQuintile(d, this.quintiles,
                                    header.indexOf('name'), header.indexOf('id'), header.indexOf('value'));
        },

        // Return a quintiled subset of the current geometry based on the first 5 characters of an ID
        // TODO filter and quintile functions can be integrated better
        filter: function(id, sublocale) {

            var topo = this.isCached(this.geographyUrl()),
                tracts = this.isCached(this.quintileUrl()),
                keys,
                query,
                i = 0,
                ii,
                filtered = [];

            // in cbsa filtering, use the topojson to determine which county IDS to show
            if (sublocale === 'cbsa') {
                // filter the features that contain the requested cbsa id
                query = _.filter(topo.features, function(d) {
                    return d.properties.cbsa === id;
                });
                keys = [];
                ii = query.length;

                // create an array containing only those ids
                for(; i < ii; ++i) {
                    keys.push(query[i].id);
                }

                filtered = filterTracts(tracts, keys);

                this.trigger('filtered:geometry', {topo: {type: 'FeatureCollection', features: query},
                     numerical: this.addQuintile(filtered, this.quintiles, 'name', 'id', 'value')
                });
            }

            // otherwise, simply get the county matches using the first 5 characters of the census fips
            else {
                query = id.slice(0, 5);
                keys = tracts.keys() || [];
                ii = keys.length;
                for(; i < ii; ++i) {
                    if (keys[i].slice(0, 5) === query) {
                        filtered.push(tracts.get(keys[i]));
                    }
                }

                this.trigger('filtered:geometry', {topo: topo,
                     numerical: this.addQuintile(filtered, this.quintiles, 'name', 'id', 'value')
                });
            }

            return;
        },

        filterOnQuintile: function(quintiles) {

            var tracts = this.isCached(this.quintileUrl()),
                keys = tracts ? tracts.keys() : [],

                i = 0,
                ii = keys.length,
                filtered = d3.map(),

                tract;

            for(; i < ii; ++i) {
                tract = tracts.get(keys[i]);
                if (quintiles.indexOf(tract.quintile) !== -1) filtered.set(keys[i], tract);
            }

            this.trigger('filtered:quintile', {topo: this.isCached(this.geographyUrl()), numerical: filtered});
        },

        addQuintile: function(d, divisions, name, id, value) {

            // new d3.map object to hold the new quintile data
            var ids = d3.map(),
                // number quintile
                quint = 0,
                j = 0,
                minmax = {},
                row,
                stop,
                data = [],
                na = [];

            // make separate lists of those that have values and those that are NA
            for ( var i = 0, ii = d.length; i < ii; ++i) {
                if (d[i][value] === 'NA') {
                    na.push(d[i]);
                } else {
                    data.push(d[i]);
                }
            }

            // sort the data with values
            data.sort(function(a, b) { return a[value] <= b[value] ? -1 : 1; });

            // minmax is used to create the legend
            minmax[quint] = [data[0][value]];

            // add the quintiles to the rows with values
            for ( i = 0,
                ii = data.length,
                stop = Math.ceil(ii/divisions);
                i < ii; ++i) {

                row = data[i];
                ids.set(row[id], {
                    quintile: quint,
                    id: row[id],
                    value: row[value],
                    name: row[name]
                });
                j += 1;
                if (j > stop) {
                    j = 0;
                    minmax[quint].push(data[i-1][value]);
                    quint += 1;
                    minmax[quint] = [row[value]];
                }
            }

            minmax[quint].push(data[ii-1][value]);
            ids.set('minmax', minmax);

            // add back in the NA values
            for ( i = 0, ii = na.length; i < ii; ++i) {
                row = na[i];
                ids.set(row[id], {
                    quintile: 'na',
                    id: row[id],
                    value: row[value],
                    name: row[name]
                });
            }

            return ids;
        },

        getBoundary: function() {
            var boundary = app.config.state.boundary,
                that,
                boundaryUrl,
                boundaryData,
                cache;

            // no boundary, remove whatever's showing
            if (boundary === 'no_boundary') {
                this.trigger('boundary:remove');
            }

            else {
                // check if the boundary data is cached
                boundaryUrl = this.boundaryUrl(boundary);
                boundaryData = this.isCached(boundaryUrl);
                // no cache, load it, cache it, then trigger the loaded event
                if (!boundaryData) {
                    that = this;
                    cache = $.proxy(this.cache, this);
                    d3.json(boundaryUrl, function(resp) {
                        resp = topojson.feature(resp, resp.objects[app.config.locateBoundary(boundary)]);
                        cache(boundaryUrl, resp);
                        that.trigger('boundary:loaded', resp);
                    });
                // cached, trigger the loaded event
                } else {
                    this.trigger('boundary:loaded', boundaryData);
                }
            }
        },
    });


    var Graphs = Backbone.Collection.extend({
        close: function() {
            this.trigger('close');
        },
        open: function() {
            this.trigger('open');
        },
        // When someone clicks on a tract, save it's code to get it's data later
        clickedOn: function(tractId) {
            if (this.tractId !== tractId) {
                this.tractId = tractId;
                this.get();
            }
            return;
        },

        get: function() {
            queue().defer(this.query, this, this.parse);
        },

        query: function(that, callback) {
            var tractData = _.find(that.models, that.predicate, that),
                fn = $.proxy(callback, that);
            if (tractData) {
                fn(tractData);
            }
            else {
                d3.json(that.url(), function(resp) {
                    fn(resp);
                });
            }
            return;
        },

        predicate: function(model) {
            // TODO currently, the models don't contain locales
            // return model.locale === app.locale && model.id === this.tractId;
            return model.id === this.tractId;
        },

        url: function() {
            return ['data', 'click', app.config.state.locale, this.tractId + '.json'].join('/');
        },

        parse: function(resp) {
            this.models.push(resp);
            this.trigger('updated', resp);
        },

    });


    app.mapData = new MapData;
    app.graphData = new Graphs;

    // map.json current maintained in google spread sheet
    // https://spreadsheets.google.com/feeds/list/1ZkZjPYZBUtdV8uJLKfazF-Nuyb7WDJ3JJYgjbWuIAQ4/od6/public/values?alt=json

    // TODO json process:
    // download google spreadsheet via python and process into .json
})();
