############################################################################
############################################################################
# This is the lookup file. It contains the locations of input csvs and
# directions for their output.
############################################################################
############################################################################

subjects = [
        #'housing',
        #'income',
        #'employment',
        'jobs',
        #'mortgage',
        #'chicago_foreclosure',
        #'rest_of_illinois_foreclosure'
        ]

basemap = 'woodstockinst.ja66l5j2'

############################################################################
############################################################################
# This is the lookup section. This is the part of the code that describes the
# raw CSVs which we will aggregate on.
#
# Under each subject, you will need to specify the following:
# - a path to the CSV files, default is under the `input/` directory
# - a list of filenames, separated by year.
# - a list of years
# - a list of the column names for the geographies we will aggregate to,
#   where id_column contains the FIPs code and display_column contains the name.
#
# Note, filenames and years must correspond in order.
# The order they are placed in determines their order in the interactive.
############################################################################
############################################################################

lookup = dict()
lookup['housing'] = {

        'path': 'input/housing/',

        'files': [
            'Vacancy_Owner_Occuppied_Housing_units_2013.csv',
            'Vacancy_Owner_Occuppied_Housing_units_2012.csv',
            'Vacancy_Owner_Occuppied_Housing_units_2011.csv',
            'Vacancy_Owner_Occuppied_Housing_units_2010.csv',
            'Vacancy_Owner_Occuppied_Housing_units_2009.csv',
            'Vacancy_Owner_Occuppied_Housing_units_2008.csv'
            ],

        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],

        'geography_headers': {

            'census_tract': {
                'id_column':        'TractFIPS',
                'display_column':   'TractFIPS'
                },

            'county': {
                'id_column':        'CountyFIPS',
                'display_column':   'County'
                },

            'cbsa': {
                'id_column':        'CBSAFIPS',
                'display_column':   'CBSAName'
                },

            'municipality': {
                'id_column':        'PlaceFIPS',
                'display_column':   'Place'
                }
            }
        }

lookup['income'] = {
        'path': 'input/income/',
        'files': [
            '20140521_Income_data.csv'
            ],
        'years': [
            '2013'
            ],
        'geography_headers': {
            'census_tract': {
                'id_column':        'CensusFIPS',
                'display_column':   'Geography Name'
                },
            'county': {
                'id_column':        'CountyFIPS',
                'display_column':   'Geography Name'
                },
            'cbsa': {
                'id_column':        'CBSAFIPS',
                'display_column':   'Geography Name'
                },
            'municipality': {
                'id_column':        'PlaceFIPS',
                'display_column':   'Geography Name'
                }
            }
        }


lookup['employment'] = {
        'path': 'input/employment/',
        'files': [
            '2013_employment.csv',
            ],
        'years': [
            '2013'
            ],
        'geography_headers': {
            'census_tract': {
                'id_column':        'census_tract',
                'display_column':   'census_tract'
                },
            'county': {
                'id_column':        'county',
                'display_column':   'county_name'
                },
            'cbsa': {
                'id_column':        'cbsa',
                'display_column':   'cbsa_name'
                },
            'municipality': {
                'id_column':        'municipality',
                'display_column':   'municipality_name'
                }
            }
        }

lookup['jobs'] = {
        'path': 'input/jobs/',
        'files': [
            '20140521_Jobs_Data.csv'
            ],
        'years': [
            '2013'
            ],
        'geography_headers': {
            'census_tract': {
                'id_column':        'census_tract',
                'display_column':   'census_tract'
                },
            'county': {
                'id_column':        'county_other',
                'display_column':   'county_name_other'
                },
            'cbsa': {
                'id_column':        'cbsa',
                'display_column':   'cbsa_name'
                },
            'municipality': {
                'id_column':        'municipality',
                'display_column':   'municipality_name'
                }
            }
        }

lookup['mortgage'] = {
        'path': 'input/mortgage/',
        'files': [
            '20140521_HMDA_2012.csv',
            '20140521_HMDA_2011.csv',
            '20140521_HMDA_2010.csv'
            ],
        'years': [
            '2012',
            '2011',
            '2010'
            ],
        'geography_headers': {
            'census_tract': {
                'id_column':        'FIPS',
                'display_column':   'FIPS'
                },
            'county': {
                'id_column':        'county',
                'display_column':   'county_name'
                },
            'cbsa': {
                'id_column':        'cbsa',
                'display_column':   'cbsa_name'
                },
            }
        }


lookup['chicago_foreclosure'] = {
        'path': 'input/foreclosure/six-county-ids/',
        'files': [
            [
                'Completed_Auctions_places_2013.csv',
                '140903_Completed_Auctions_tracts_2013.csv',
                'Foreclosure_Filings_places_2013.csv',
                '140903_Foreclosure_Filings_tracts_2013.csv',
                ],

            [
                'Completed_Auctions_places_2012.csv',
                '140903_Completed_Auctions_tracts_2012.csv',
                'Foreclosure_Filings_places_2012.csv',
                '140903_Foreclosure_Filings_tracts_2012.csv',
                ],

            [
                'Completed_Auctions_places_2011.csv',
                '140903_Completed_Auctions_tracts_2011.csv',
                'Foreclosure_Filings_places_2011.csv',
                '140903_Foreclosure_Filings_tracts_2011.csv',
                ],

            [
                'Completed_Auctions_places_2010.csv',
                '140903_Completed_Auctions_tracts_2010.csv',
                'Foreclosure_Filings_places_2010.csv',
                '140903_Foreclosure_Filings_tracts_2010.csv',
                ],

            [
                'Completed_Auctions_places_2009.csv',
                '140903_Completed_Auctions_tracts_2009.csv',
                'Foreclosure_Filings_places_2009.csv',
                '140903_Foreclosure_Filings_tracts_2009.csv',
                ],

            [
                'Completed_Auctions_places_2008.csv',
                '140903_Completed_Auctions_tracts_2008.csv',
                'Foreclosure_Filings_places_2008.csv',
                '140903_Foreclosure_Filings_tracts_2008.csv',
                ]
            ],
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],

        'geography_headers': {
            'census_tract': {
                'id_column':        'FIPS',
                'display_column':   'FIPS'
                },
            'county': {
                'id_column':        'county',
                'display_column':   'county_name'
                },
            'cbsa': {
                'id_column':        'cbsa',
                'display_column':   'cbsa_name'
                },
            'municipality': {
                'id_column':        'Place FIPS',
                'display_column':   'Municipality'
                }
            }
        }


lookup['rest_of_illinois_foreclosure'] = {
        'path': 'input/foreclosure/non-six-county-ids/',
        'files': [
            [
                '140903_2013_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2013_Residential_NOS_Non_six_county_statewide_foreclosures_places.csv',
                '140903_2013_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2013_Residential_LIS_Non_six_county_statewide_foreclosures_places.csv'
                ],

            [
                '140903_2012_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2012_Residential_NOS_Non_six_county_statewide_foreclosures_places.csv',
                '140903_2012_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2012_Residential_LIS_Non_six_county_statewide_foreclosures_places.csv'
                ],

            [
                '140903_2011_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2011_Residential_NOS_Non_six_county_statewide_foreclosures_places.csv',
                '140903_2011_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2011_Residential_LIS_Non_six_county_statewide_foreclosures_places.csv'
                ],

            [
                '140903_2010_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2010_Residential_NOS_Non_six_county_statewide_foreclosures_places.csv',
                '140903_2010_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2010_Residential_LIS_Non_six_county_statewide_foreclosures_places.csv'
                ],

            [
                '140903_2009_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2009_Residential_NOS_Non_six_county_statewide_foreclosures_places.csv',
                '140903_2009_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2009_Residential_LIS_Non_six_county_statewide_foreclosures_places.csv'
                ],

            [
                '140903_2008_Residential_NOS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2008_Residential_NOS_Non_six_county_statewide_foreclosures_places.csv',
                '140903_2008_Residential_LIS_Non_six_county_statewide_foreclosures_tracts.csv',
                '2008_Residential_LIS_Non_six_county_statewide_foreclosures_places.csv'
                ]
            ],
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],

        'geography_headers': {
            'census_tract': {
                'id_column':        'FIPS',
                'display_column':   'FIPS'
                },
            'county': {
                'id_column':        'county',
                'display_column':   'county_name'
                },
            'cbsa': {
                'id_column':        'cbsa',
                'display_column':   'cbsa_name'
                },
            'municipality': {
                'id_column':        'Place FIPS',
                'display_column':   'Municipality'
                }
            }
        }


############################################################################
############################################################################
# This is the metrics section. This is where we describe each metric, such as
# percent long-term vacancy, that goes into the interactive.
#
# For each metric, we include the column names which provide data for that
# metric, and the operations that we will perform on them. A list of built-in
# operations are documented below.
#
# In addition, we include the following:
#
# - display name
# - mapid, which simply tells the interactive where to find the directory
# - years of data, which is important for percent change in vacancy, a metric
#   where the available data years is one fewer than the available years of
#   housing data
# - a list of geographies where this data will be shown
#
# Below is a list of operations. Each operation will act on the columns listed
# in the column_names property. The columns will be referred to as column 1,
# column 2, column 3, etc. in the order that they appear
#
# - simple_percent: sum of all column 1 / sum of all column 2, for each tract.
#                   returns 0 if sum of all column 2 is 0.
#
# -
############################################################################
############################################################################

metrics = dict()
metrics['housing'] = [

    {
        'name': 'Percent Long-Term Vacancy',
        'mapid': 'long_term_vacancy',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'TctPl LongResVac_Average',
            'PlaceTractHousingUnits'
            ]
        },

    {
        'name': 'Change in Long-Term Vacancy From Prior Year',
        'mapid': 'change_long_term_vacancy',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009'
            ],
        'type': 'percent',
        'operation': 'change_over_last',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'TctPl LongResVac_Average',
            ]
        },

    {
        'name': 'Percent Owner-Occupied',
        'mapid': 'vacancy_pct_owner_occupied',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'PlaceTractOwnerOccupiedUnits',
            'PlaceTractHousingUnits'
            ]
        }
    ]

metrics['income'] = [
    {
        'name': 'Average Household Income',
        'mapid': 'avg_household_income',
        'years': [
            '2013'
            ],
        'type': 'currency',
        'operation': 'aggregate',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Average Household Income'
            ]
        },

    {
        'name': 'Median Household Income',
        'mapid': 'med_household_income',
        'years': [
            '2013'
            ],
        'type': 'currency',
        'operation': 'aggregate',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Median Income'
            ]
        },

    {
        'name': 'Per-Capita Income',
        'mapid': 'capita_income',
        'years': [
            '2013'
            ],
        'type': 'currency',
        'operation': 'aggregate',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Per Capita Income'
            ]
        },

    {
        'name': 'Percent of Population in Poverty',
        'mapid': 'pct_poverty',
        'years': [
            '2013'
            ],
        'type': 'percent',
        'operation': 'aggregate',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Percent in Poverty'
            ]
        }
    ]

metrics['employment'] = [
    {
        'name': 'Employment Rate',
        'mapid': 'pct_employment',
        'years': [
            '2013'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'employed',
            'wf'
            ]
        },

    {
        'name': 'Percent Females Employed',
        'mapid': 'pct_f_employment',
        'years': [
            '2013'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'female_employed',
            'female_wf'
            ]
        },

    {
        'name': 'Percent Males Employed',
        'mapid': 'pct_m_employment',
        'years': [
            '2013'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'male_employed',
            'male_wf'
            ]
        }
    ]

metrics['jobs'] = [
    {
        'name': 'Percent Jobs Held By Women',
        'mapid': 'pct_f_jobs',
        'years': [
            '2013'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'female_jobs',
            'total_jobs'
            ]
        },

    {
        'name': 'Percent Jobs Held By Men',
        'mapid': 'pct_m_jobs',
        'years': [
            '2013'
            ],
        'type': 'percent',
        'operation': 'simple_percent',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'male_jobs',
            'total_jobs'
            ]
        }
    ]

metrics['mortgage'] = [
    {
        'name': 'Percent Mortgages For Owner-Occupied Homes',
        'mapid': 'mortgage_pct_for_owner_occupancy',
        'years': [
            '2012',
            '2011',
            '2010'
            ],
        'tract_files': {
            '2012': '2010',
            '2011': '2000',
            '2010': '2000'
            },
        'type': 'percent',
        'operation': 'percent_of_values_equal',
        'value_to_look_for': '1',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa'
            ],
        'column_names': [
            'Occupancy'
            ]
        },

    {
        'name': 'Percent Originated',
        'mapid': 'pct_origin',
        'years': [
            '2012',
            '2011',
            '2010'
            ],
        'tract_files': {
            '2012': '2010',
            '2011': '2000',
            '2010': '2000'
            },
        'type': 'percent',
        'operation': 'percent_of_values_equal',
        'value_to_look_for': '1',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa'
            ],
        'column_names': [
            'Action'
            ]
        },

    {
        'name': 'Percent Conventional Loans',
        'mapid': 'pct_conventional',
        'years': [
            '2012',
            '2011',
            '2010'
            ],
        'tract_files': {
            '2012': '2010',
            '2011': '2000',
            '2010': '2000'
            },
        'type': 'percent',
        'operation': 'percent_of_values_equal',
        'value_to_look_for': '1',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa'
            ],
        'column_names': [
            'LoanType'
            ]
        },

    {
        'name': 'Average Loan Value',
        'mapid': 'avg_loan_value',
        'years': [
            '2012',
            '2011',
            '2010'
            ],
        'tract_files': {
            '2012': '2010',
            '2011': '2000',
            '2010': '2000'
            },
        'type': 'currency',
        'operation': 'simple_average',
        'format_operation': 'thousands_to_ones',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa'
            ],
        'column_names': [
            'LoanAmount'
            ]
        }
    ]

metrics['chicago_foreclosure'] = [
    {
        'name': 'Completed Auctions per Thousand Mortgagable Properties',
        'mapid': 'completed_auctions_per_1000',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],
        'type': 'number',
        'operation': 'simple_division',
        'format_operation': 'thousands_to_ones_round',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Total Auctions',
            'Mortgagable Structures'
            ]
        },

    {
        'name': 'Foreclosure Filings per Thousand Mortgagable Properties',
        'mapid': 'foreclosure_filings_per_1000',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],
        'type': 'number',
        'operation': 'simple_division',
        'format_operation': 'thousands_to_ones_round',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Total Filings',
            'Mortgagable Structures'
            ]
        }
    ]


metrics['rest_of_illinois_foreclosure'] = [
    {
        'name': 'Total Notices of Sale per Thousand Mortgagable Properties',
        'mapid': 'nos_per_1000',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],
        'type': 'number',
        'operation': 'simple_division',
        'format_operation': 'thousands_to_ones_round',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Total NOS',
            'Mortgagable Structures'
            ]
        },

    {
        'name': 'Foreclosure Filings per Thousand Mortgagable Properties',
        'mapid': 'foreclosure_filings_per_1000_il',
        'years': [
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008'
            ],
        'type': 'number',
        'operation': 'simple_division',
        'format_operation': 'thousands_to_ones_round',
        'reverse': 'false',
        'geographies': [
            'census_tract',
            'county',
            'cbsa',
            'municipality'
            ],
        'column_names': [
            'Total Filings',
            'Mortgagable Structures'
            ]
        }
    ]








############################################################################
############################################################################

graphs = dict()
graphs['charts'] = [
    {
        'subject': 'housing',
        'mapid': 'long_term_vacancy',
        'display': ' residential addresses vacancy (%)',
        'type': 'percent',
        },
    {
        'subject': 'mortgage',
        'mapid': 'avg_loan_value',
        'display': ' average mortgage value ($)',
        'type': 'currency'
        }
    ]

graphs['numbers'] = [
    {
        'subject': 'income',
        'mapid': 'capita_income',
        'display': 'Per capita income',
        'type': 'currency',
        },
    {
        'subject': 'employment',
        'mapid': 'pct_employment',
        'display': 'Employment rate',
        'type': 'percent'
        }
    ]
