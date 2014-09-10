import os
from lib import csvtools as ct
from lib import jsontools as jt


def mkdir(path):
    if not os.path.isdir(path):
        os.makedirs(path)
    return path


def add_cbsa_by_county_id(data, county):
    dictionary = jt.read('rosetta/county-cbsa.json')

    unmatched = list()
    for row in data:
        countyfips = row[county]

        if countyfips in dictionary:
            match = dictionary[countyfips]
            row.append(match['name'])
            row.append(match['id'])
            continue
        else:
            unmatched.append(row)
            continue

    if len(unmatched):
        print ('\n').join(unmatched)

    return data


def add_county_by_name(data, county):
    dictionary = jt.read('rosetta/county-names.json')

    unmatched = list()
    for row in data:
        tractname = row[county]

        if tractname in dictionary:
            match_id = dictionary[tractname]
            row.append(match_id)
            continue

        else:
            unmatched.append(row)
            continue

    if len(unmatched):
        print ('\n').join(unmatched)

    return data

def add_cbsa_county(data, FIPS):

    h = data.pop(0)
    tract_index = h.index(FIPS)

    path = 'rosetta/'
    cbsa = {
            'id'            : 'cbsa',
            'name'          : 'cbsa_name',
            'file'          : 'census_tract-cbsa.json'
            }
    county = {
            'id'            : 'county',
            'name'          : 'county_name',
            'file'          : 'census_tract-county.json'
            }

    for key in [county, cbsa]:

        dictionary = jt.read(path + key['file'])
        h.extend([key['id'], key['name']])

        nomatch = 0

        for row in data:
            tractid = row[tract_index]
            if tractid in dictionary:
                match = dictionary[tractid]
                row.extend([match['id'], match['name']])
            else:
                row.extend(['',''])
                nomatch += 1

        if nomatch > 0:
            print '%s unmatched for %s' % (nomatch, key['id'])


    return [h] + data

input_path = 'input/foreclosure/data-na/'
output_path = 'input/foreclosure/data-na-ids/'

years = ['2008', '2009', '2010', '2011', '2012', '2013']

file_meta = [
    ['140903_', '_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv'],
    ['140903_', '_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv'],
    ['140903_Completed_Auctions_tracts_', '.csv'],
    ['140903_Foreclosure_Filings_tracts_', '.csv']
    ]

for year in years:
  for f in file_meta:
    d = ct.read(input_path + f[0] + year + f[1])
    cbsa_county = add_cbsa_county(d, 'FIPS')
    ct.write(cbsa_county, output_path + f[0] + year + f[1])
