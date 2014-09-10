from lib import csvtools
from lib import jsontools
import os

# take foreclosure csvs and make sure the csv headers are all the same
input_path = 'input/foreclosure/data-na/'
output_path = 'input/foreclosure/data-na-ids/'

years = ['2008', '2009', '2010', '2011', '2012', '2013']

file_meta = [
    ['140903_', '_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv'],
    ['140903_', '_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv'],
    ['140903_Completed_Auctions_tracts_', '.csv'],
    ['140903_Foreclosure_Filings_tracts_', '.csv']
    ]

def foreclosure_headers():
  for f in file_meta:

    first_year = csvtools.read(input_path + f[0] + years[0] + f[1])
    header = first_year[0]

    # make the header the same
    for year in years[1:]:
      subsequent = csvtools.read(input_path + f[0] + year + f[1])
      if len(subsequent[0]) != len(header):
        print 'weirdness \n %s \n %s' % (subsequent[0], header)
      csvtools.write(subsequent, output_path + f[0] + year + f[1])

    csvtools.write(first_year, output_path + f[0] + years[0] + f[1])


def make_fips():
  for f in file_meta:
    for year in years:
      d = csvtools.read(output_path + f[0] + year + f[1])
      h = d[0]
      if not 'FIPS' in h:
        print h, f, year


def mortgageable():
  path = 'input/foreclosure/'
  dirs = ['six-county-ids/', 'non-six-county-ids/']

  for d in dirs:
    csvs = [f for f in os.listdir(path + d) if f[-4:] == '.csv']
    for c in csvs:
      data = csvtools.read(path + d + c)
      h = data[0]

      if 'Mortgageable Structures' in h:
        i = h.index('Mortgageable Structures')
        data[0][i] = 'Mortgagable Structures'
        print 'changing once'
        csvtools.write(data, path + d + c)

