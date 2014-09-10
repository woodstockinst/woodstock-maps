import os
from lib import csvtools as ct
from lib import jsontools as jt


def mkdir(path):
    if not os.path.isdir(path):
        os.makedirs(path)
    return path


nos_file = '_Residential_NOS_Non_six_county_statewide_foreclosures_'
lis_file = '_Residential_LIS_Non_six_county_statewide_foreclosures_'

files = {
        2008: ['tracts.csv', 'places.csv'],
        2009: ['tracts.csv', 'places.csv'],
        2010: ['tracts.csv', 'places.csv'],
        2011: ['tracts.csv', 'places.csv'],
        2012: ['tracts.csv', 'places.csv'],
        2013: ['tracts.csv', 'places.csv']
        }

path = 'input/foreclosure/non-six-county/'

for year in files:
    print '\n\n', year

    for ending in files[year]:

        lis = ct.read_as_dict(path + str(year) + lis_file + ending)
        nos = ct.read_as_dict(path + str(year) + nos_file + ending)

        for row in nos:
            if 'Place FIPS' in row:
                key = 'Place FIPS'
            else:
                key = 'FIPS'

            print row[key]
            matching_row = ct.find_in(row[key], lis, key)
            if matching_row == -1:
                print 'nomatch'

        print yy



