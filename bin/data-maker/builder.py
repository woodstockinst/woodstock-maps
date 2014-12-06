import math
import os
import sys
from lib import csvtools
from lib import jsontools
from lib import dictools as dt
from lib import lookup



############################################################
############################################################
############################################################
####################### Utilities ##########################
############################################################
############################################################
############################################################

def __float__(s):
    n = 0.0
    if s != 'NOT AVAILABLE':
        try:
            n = float(s)
        except:
            # print '\nProblem parsing "%s" as a decimal number (float)' % s
            print '\nParsing %s as 0.0' % s
    return n


def __int__(s):
    n = 0
    if s != 'NOT AVAILABLE':
        try:
            n = int(s)
        except:
            # print '\nProblem parsing "%s" as a whole number (integer)' % s
            print '\nParsing %s as 0' % s
    return n


def find_where(array_of_dict, key, value):
    for dictionary in array_of_dict:
        if dictionary[key] == value:
            return dictionary
    return False


def find_index_where(array_of_dict, key, value):
    for index, dictionary in enumerate(array_of_dict):
        if dictionary[key] == value:
            return index
    return -1


def find_in_list(array_of_arrays, index, value):
    for array in array_of_arrays:
        if array[index] == value:
            return array
    return False


def mkdir(path):
    if not os.path.isdir(path):
        os.makedirs(path)
    return path


def pluck_uniques(array, index):
    result = dict()
    for row in array:
        if row[index] in result:
            result[row[index]].append(row)
        else:
            result[row[index]] = [row]
    return result


def calc_average(array):
    return math.fsum(array) / len(array)


def calc_median(array):
    length = len(array)
    mid = int(math.floor(length / 2))
    if mid * 2 == length:
        median = calc_average(array[mid-1:mid+1])
    else:
        median = array[mid]
    return median

# takes as an argument a list of lists and indices. checks each index
# for each list in the great list, returns true if they are ALL == 'NOT AVAILABLE'
def is_available(array, indices):
    for row in array:
        for i in indices:
            if 'not available' not in row[i].lower():
                return True
            continue
        continue
    return False


############################################################
############################################################
############################################################
########################### I/O ############################
############################################################
############################################################
############################################################


def metrics_from_csv(subject, geography_ref, headers):

    data = dict()
    location = lookup.lookup[subject]
    for index, data_year in enumerate(location['years']):
        data[data_year] = list()

        filename = location['files'][index]
        # is the filename a string? if so, it's only one file
        if isinstance(filename, basestring):
            filenames = [filename]
        # multiple files; combine them.
        else:
            filenames = filename

        geo = location['geography_headers'][geography_ref]
        new_header = [
                geo['id_column'],
                geo['display_column']
                ]
        new_header.extend(headers)


        for filename in filenames:

            path = location['path'] + filename
            if not os.path.isfile(path):
                print '\n\n', '%s does not exist at %s' % (filename, location['path'])
                return False

            dump = csvtools.read(path)
            dump_header = [header.lower().strip() for header in dump.pop(0)]

            # we need all columns to be present in order to work on it.
            # if we don't have all the columns, skip this file.
            indices = list()
            unmatched_headers = list()
            for header in new_header:
                header = header.lower()
                if header in dump_header:
                    indices.append(dump_header.index(header))
                else:
                    unmatched_headers.append(header)

            if len(indices) != len(new_header):
                # print 'Not all indices present, continuing to next file'
                # print (', ').join(dump_header)
                # print 'Missing %s\n' % (', ').join(unmatched_headers)
                continue

            else:
                for csv_row in dump:
                    # if the index for name or fips code is empty, continue
                    if csv_row[indices[0]].strip() == '' || csv_row[indices[1]].strip() == '':
                        continue
                    # if it's not cbsa, fips code start with 17
                    elif geography_ref == 'cbsa' or csv_row[indices[0]][0:2] == '17':
                        data_row = list()
                        for index in indices:
                            data_row.append(csv_row[index])
                        data[data_year].append(data_row)
                continue # for csv row
    return data


class Metric(object):
    def __init__(self, properties):
        try:
            self.name = properties['name']
            self.mapid = properties['mapid']
            self.years = properties['years']
            self.operation = properties['operation']
            self.geographies = properties['geographies']
            self.cols = properties['column_names']
            self.reverse = properties['reverse']
            self.go = True
        except:
            print '\n\n', 'A metric is missing a property.'
            print 'Make sure each metric has a name, mapid, years, and operation'
            print 'Even metrics that have a single year need years'
            print 'Check out the %s metric in lookup.py' % properties['name']
            self.go = False

        if 'value_to_look_for' in properties:
            self.value_to_look_for = properties['value_to_look_for']
        if 'format_operation' in properties:
            self.format_operation = properties['format_operation']




############################################################
############################################################
############################################################
######################## Operations ########################
############################################################
############################################################
############################################################

def aggregate(all_data, years):
    results = dict();
    for year in years:
        data = pluck_uniques(all_data[year], 0)
        data_year = [['id', 'name', 'value']]

        for key, rows in data.items():
            sum_total = math.fsum([__float__(row[2]) for row in rows])
            if sum_total % 1 == 0.0:
                sum_total = int(sum_total)

            data_year.append([key, rows[0][1], sum_total])
            continue
        results[year] = data_year
        continue
    return results

def simple_pct(all_data, years):
    results = dict()
    for year in years:
        data = pluck_uniques(all_data[year], 0)
        data_year = [['id', 'name', 'value']]

        for key, rows in data.items():
            if is_available(rows, [2,3]):
                sum_total = math.fsum([__float__(row[2]) for row in rows])
                sum_total_all = math.fsum([__float__(row[3]) for row in rows])
                percent = 0
                if sum_total_all != 0.0:
                    percent = round(sum_total * 100 / sum_total_all, 2)
            else:
                percent = 'NA'

            data_year.append([key, rows[0][1], percent])
            continue
        results[year] = data_year
        continue
    return results

def simple_division(all_data, years):
    results = dict()

    for year in years:
        data = pluck_uniques(all_data[year], 0)
        data_year = [['id', 'name', 'value']]

        for key, rows in data.items():
            if is_available(rows, [2,3]):
                sum_total = math.fsum([__float__(row[2]) for row in rows])
                sum_total_all = math.fsum([__float__(row[3]) for row in rows])
                result = 0
                if sum_total_all != 0.0:
                    result = sum_total / sum_total_all
                if result % 1 == 0.0:
                    result = int(result)
            else:
                result = 'NA'

            data_year.append([key, rows[0][1], result])
            continue
        results[year] = data_year
        continue
    return results

def change_over_last(all_data, years):
    int_years = [__int__(year) for year in years]
    lowest = min(int_years)
    if lowest == 0:
        print '\n\n', 'Couldn\'t convert years to numbers', (', ').join(years)
        return False

    last = lowest - 1
    # User included only the years we should show.
    # Still, get smallest year as a pct so we can calculate the next year
    if str(last) in all_data:
         int_years += [last]

    int_years = sorted(int_years, reverse=True)
    results = dict()

    # Aggregate on geography beforehand, then find the change over year
    temp = dict()
    for year in int_years:
        temp[year] = pluck_uniques(all_data[str(year)], 0)
        continue

    for year in int_years:

        # do nothing if it's the last year
        year_last = year - 1
        if not year_last in int_years:
            continue

        data_year = [['id', 'name', 'value']]
        for key, value in temp[year].items():
            if key in temp[year_last]:

                value_this = math.fsum([__float__(row[2]) for row in value])
                value_last = math.fsum([__float__(row[2]) for row in temp[year_last][key]])

                if value_last == 0:
                    change = value_this
                else:
                    change = round((value_this - value_last) * 100 / value_last, 2)
            else:
                print 'No key'
                change = 'null'

            data_year.append([row[0], row[1], change])
            continue
        results[str(year)] = data_year
        continue
    return results

def count_and_percent(all_data, years, target):
    results = dict()
    for year in years:
        data = pluck_uniques(all_data[year], 0)
        data_year = [['id', 'name', 'value']]

        for key, rows in data.items():
            total = len(rows)
            times = len(['x' for row in rows if row[2] == target])
            percent = round(times * 100 / total, 2)
            if percent % 1 == 0.0:
                percent = int(percent)

            data_year.append([key, rows[0][1], percent])
            continue
        results[year] = data_year
        continue
    return results

def average(all_data, years):
    results = dict()
    for year in years:
        data = pluck_uniques(all_data[year], 0)
        data_year = [['id', 'name', 'value']]

        for key, rows in data.items():
            tracts = len(rows)
            total_val = math.fsum([__float__(row[2]) for row in rows])
            average = round(total_val / tracts, 2)

            if average % 1 == 0.0:
                average = int(average)

            data_year.append([key, rows[0][1], average])
            continue
        results[year] = data_year
        continue
    return results


############################################################
############################################################
############################################################
#################### Format Operations #####################
############################################################
############################################################
############################################################

def thousands_to_ones(data):
    results = dict()
    for year, rows in data.items():

        data_year = [rows.pop(0)]
        for row in rows:
            if row[2] != 'NA':
                val = __float__(row[2])
                row[2] = val * 1000
                if row[2] % 1 == 0:
                    row[2] = int(row[2])
            data_year.append(row)
            continue
        results[year] = data_year
        continue
    return results

def thousands_to_ones_round(data):
    results = dict()
    for year, rows in data.items():

        data_year = [rows.pop(0)]
        for row in rows:
            if row[2] != 'NA':
                val = __float__(row[2])
                row[2] = round(val * 1000, 2)
                if row[2] % 1 == 0:
                    row[2] = int(row[2])
            data_year.append(row)
            continue
        results[year] = data_year
        continue
    return results


operation_map = {
        'simple_percent':               simple_pct,
        'change_over_last':             change_over_last,
        'aggregate':                    aggregate,
        'percent_of_values_equal':      count_and_percent,
        'simple_average':               average,
        'simple_division':              simple_division,
        }

format_operation_map = {
        'thousands_to_ones':            thousands_to_ones,
        'thousands_to_ones_round':      thousands_to_ones_round,
        }


############################################################
############################################################
############################################################
#################### Main Build Script #####################
############################################################
############################################################
############################################################

def build(write):

    subjects = lookup.subjects
    config = dict()

    base = 'output/maps'
    mkdir(base)
    base += '/'
    for subject in subjects:
        mkdir(base + subject)

        metrics = lookup.metrics
        for metric_data in metrics[subject]:

            # Puts dictionary values into an empty class for easy access
            metric = Metric(metric_data)
            if not metric.go:
                print '\n\n'
                print 'We are missing properties and aborting a metric for %s' % subject
                continue

            print '\n\n'
            print 'Parsing %s for %s' % (metric.name, subject)

            mkdir(base + '%s/%s' % (subject, metric.mapid))
            for geography_type in metric.geographies:

                data = metrics_from_csv(subject, geography_type, metric.cols)
                if data == False:
                    print 'Error parsing data and aborting metric %s' % metric.name
                # do the calculations on the available data
                mkdir(base + '%s/%s/%s' % (subject, metric.mapid, geography_type))
                parse_function = operation_map[metric.operation]

                # is there a value to pass? if so, pass it
                if hasattr(metric, 'value_to_look_for'):
                    parsed_data = parse_function(data, metric.years, metric.value_to_look_for)
                else:
                    parsed_data = parse_function(data, metric.years)

                # is there a format operation? if so, run it
                if hasattr(metric, 'format_operation'):
                    format_function = format_operation_map[metric.format_operation]
                    parsed_data = format_function(parsed_data)

                if parsed_data == False:
                    print 'Error parsing data and aborting metric %s' % metric.name
                    continue

                print '%s parsed %s' % (len(parsed_data[metric.years[0]]) - 1,
                        geography_type)


                if metric.reverse == 'true':
                    reverse = True
                else:
                    reverse = False

                for year in metric.years:
                    parsed_data_year = [parsed_data[year][0]] + sorted(parsed_data[year][1:],
                            cmp = lambda x,y: cmp(x[2], y[2]), reverse=reverse)

                    # name and fips are the same for census tract; only keep one
                    if geography_type == 'census_tract':
                        for index, row in enumerate(parsed_data_year):
                            parsed_data_year[index] = [row[0], row[2]]

                    if write:
                        jsontools.write(parsed_data_year, base + '%s/%s/%s/%s.json' %
                                (subject, metric.mapid, geography_type, year))

                    # /years
                # /geographies
            # /metrics
        # /subjects

def separate_and_upper(s):
    result = s.lower().split('_')
    upper = [word[0].upper() + word[1:] for word in result]
    return (' ').join(upper)



def schema(write):

    subjects = [
            'chicago_foreclosure',
            'rest_of_illinois_foreclosure',
            'housing',
            'mortgage',
            'income',
            'employment',
            'jobs',
            ]

    schema = list()
    for subject_name in subjects:
        subject = dict()
        config = lookup.lookup[subject_name]
        metrics = lookup.metrics[subject_name]

        subject['subject'] = separate_and_upper(subject_name)

        subject['locale'] = list()
        for locale in metrics[0]['geographies']:
            # let cbsa be all caps, other geographies cap first letter of each word
            if locale == 'cbsa':
                subject['locale'].append('CBSA')
            else:
                subject['locale'].append(separate_and_upper(locale))
            continue

        subject['metrics'] = list()
        for metric in metrics:
            subject['metrics'].append({
                'map': metric['name'],
                'mapid': metric['mapid'],
                'years': metric['years'],
                'type': metric['type']
                })
            continue

        subject['schema'] = list()
        for metric in metrics:
            subject['schema'].append(metric['mapid'])
            continue

        for metric in metrics:
            if 'tract_files' in metric:
                subject['tractfiles'] = metric['tract_files']

        schema.append(subject)

    graphs = lookup.graphs['charts'] + lookup.graphs['numbers']
    for graph in graphs:
        graph['medians'] = list()
        # generate median values using census tracts
        path = 'output/maps/%s/%s/census_tract/' % (graph['subject'], graph['mapid'])

        for metric in lookup.metrics[graph['subject']]:
            if metric['mapid'] == graph['mapid']:
                graph['years'] = sorted([__int__(year) for year in metric['years']])

        for year in graph['years']:
            filename = path + '%s.json' % year
            data = jsontools.read(filename)
            header = data.pop(0)

            available_data = [row for row in data if row[1] != 'NA']

            length = len(available_data)
            mid = int(math.floor(length/2))
            if mid*2 == length:
                median = round((__float__(available_data[mid-1][1]) + __float__(available_data[mid+1][1])) / 2, 2)
            else:
                median = __float__(available_data[mid][1])

            graph['medians'].append(median)

    config = dict()
    config['schema'] = schema
    config['graphs'] = graphs
    config['basemap'] = lookup.basemap

    if write:
        jsontools.pretty_write(config, 'output/config.json')

    return



def click(write):
    charts = lookup.graphs['charts']
    numbers = lookup.graphs['numbers']

    # Just combining all the json files first
    graphs = dict()
    for chart in charts + numbers:
        subject = chart['subject']
        metric = chart['mapid']
        path = 'output/maps/%s/%s/' % (subject, metric)

        graphs[metric] = dict()

        locales = lookup.lookup[subject]['geography_headers'].keys()
        for locale in locales:

            graphs[metric][locale] = dict()

            metrics = lookup.metrics[subject]
            for m in metrics:
                if m['mapid'] == metric:
                    years = m['years']

            if not years:
                print 'Error in creating click data. Please check your parameters'
                continue

            years = sorted([__int__(year) for year in years])

            for year in years:
                yeardata = jsontools.read(path + '%s/%s.json' % (locale, year))

                header = yeardata.pop(0)

                for row in yeardata:
                    tractid = row[0]
                    if tractid in graphs[metric][locale]:
                        graphs[metric][locale][tractid]['data'].append(row[len(row)-1])
                    else:
                        graphs[metric][locale][tractid] = {
                                'data': [row[len(row)-1]],
                                'name': row[len(row) - 2]
                                }



    output = 'output/click/'
    mkdir(output)

    all_tracts = dict()
    for metric in graphs:
        for locale, tracts in graphs[metric].items():
            mkdir(output + locale)

            for tractid, metric_data in tracts.items():
                tractid = str(tractid)

                if not tractid in all_tracts:
                    all_tracts[tractid] = dict()

                if not locale in all_tracts[tractid]:
                    all_tracts[tractid][locale] = dict()

                all_tracts[tractid][locale][metric] = metric_data['data']
                all_tracts[tractid][locale]['name'] = metric_data['name']

    for tractid, locales in all_tracts.items():
        for locale, tractdata in locales.items():
            if write:
                jsontools.write(tractdata, output + '%s/%s.json' % (locale, tractid))

mkdir('output')

build(write=True)
schema(write=True)
click(write=True)
