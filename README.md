# Working with github

## How will we deliver the site?

1. Register an account on GitHub: https://github.com
2. Create a repository in GitHub: https://help.github.com/articles/create-a-repo
3. We will popuplate the repository with files and processed data.

We use GitHub Pages to host the website because it is free, reliable, and provides a smooth workflow. The delivered website will live under the `gh-pages` [branch](https://help.github.com/articles/branching-out#branches) in the GitHub repository, whose code is open to public.

![](http://f.cl.ly/items/3l0T2Q0F3x0u1I2F3H17/Screen%20Shot%202014-07-29%20at%2011.42.29%20AM.png)

## How do you maintain the site?

You can use the [GitHub for Windows](https://windows.github.com/) to push changes to the repository. Follow the tutorials to add the repo you created to the interface: https://windows.github.com/help.html

You will also need to download an installer for `node.js` and `npm` as they are required by the script used to change geography files: http://nodejs.org/dist/v0.10.29/node-v0.10.29-x86.msi. Follow the intructions and you should be set.

## Update data

You will be running the scripts that process the data and push the changes to GitHub. You will mostly be looking at two folders:

1. `/bin`. Scripts for updating the data
2. `/data`. Outcomes of the data, site configuration

Scripts will be run in terminal. You can familiarize with a few common command line from [this video](https://www.youtube.com/watch?v=jbvqCqb-HJk).

The steps for updating numeric data and some geographic data are documented below.

### Change numeric data

#### Short version

1. Open the file named `lookup.py` under `/bin/lib`. Make sure to create a copy before editing.
3. Follow the directions in that file to add variables, introduce new columns or operations, and add years of data.
3. Run the python script named `build.py` under `/bin`.
4. Copy the contents of `/bin/output` into `/data/json`, over-writing the existing files.

#### Long version

We've written a python script that will convert formatted CSV's into JSON data files that can be loaded in a web browser. The script relies on a set of parameters contained in `lookup.py`, which you can think of as metadata. These include locations of CSV files, which columns of data to use which operations on, the geographies we aggregate to, and the years of data we show. Further directions are documented in `lookup.py`, which you can open in a code-ready text editor such as [Notepad++](http://notepad-plus-plus.org/download/v6.6.8.html) for Windows or [TextWrangler](http://www.barebones.com/products/textwrangler/download.html) for OSX.

After editing your paramters, run `build.py` using a command line shell with Python 2.7 installed. The script will calculate new JSON files and place them in `/bin/output`. You can copy these files directly into `/data/json`, over-writing the existing files there.

We suggest you keep a copy of `lookup.py` and treat it as the master configuration version before making any changes. This will allow you to revert to the delivered data set at any time.

#### On using Python

The script to generate numeric data is written entirely in Python. That said, `lookup.py` can be modified with only basic knowledge of Python grammar, since it contains only configuration variables and not logic. `build.py` contains the build logic, and new operations can be written into this file. This will require above-beginnner-level knowledge of the language.

This script will run on the version of Python that comes bundled with OSX. It requires no external dependencies outside of what's already in `/bin`. For Windows users, several version of python are [available for download on python.org](https://www.python.org/downloads/windows/), or can be installed as part of a larger Linux-tools bundle from the [Cygwin](http://cygwin.com/) project. While the script is most likely to work on Python 2.7.5, it will work on any version of Python 2.7.

### Notes on geography

#### Boundaries

- All census boundaries in the download use CBF (Cartographic Boundary Files).
  - Excludes major water bodies, which is crucial to Illinois (Lake Michigan)
  - CBF does not apply to CBSA
  - Read more: https://www.census.gov/geo/maps-data/data/tiger-cart-boundary.html

- These two errors are expected when you run `make` for the first time:
  - `make: *** No rule to make target shp/il_legislative/PA_97-6_Senate_Districts.shp', needed by topo/il_senate.json'.  Stop.`
  - `make: *** No rule to make target shp/il_legislative/PA_97-6_House_Districts.shp', needed by topo/il_house.json'.  Stop.`

- If you run into the above error(s), run `make shp/il_legislative` and then `make` again. (This roundabout is a result of odd file/folder naming of the IL legislative boundary files).

#### External properties

- CBSA-County Crosswalk
  - [Read more](http://www.nber.org/data/cbsa-msa-fips-ssa-county-crosswalk.html)
  - File used: [cbsatocountycrosswalk.csv](http://www.nber.org/cbsa-msa-fips-ssa-county-crosswalk/cbsatocountycrosswalk.csv)
  - Processed with LibreOffice and [csvkit](https://csvkit.readthedocs.org/en/0.7.3/)
  - Counties without cbsa are noted with a cbsa code of `99` and a cbsaname of `na`.

- House, Senate, Congress
  - Data from Illinois General Assembly and Wikipedia
    - [Senate](http://www.ilga.gov/senate/)
    - [House](http://www.ilga.gov/house/)
    - [Congressional](http://en.wikipedia.org/wiki/Illinois's_congressional_districts)
  - Processed with Google Refine and csvkit

#### Changing external properties

We anticipate attributes associated with the legislative boundaries are subject to change, namely, representatives and parties. To update the legislative information, edit the respective csv in the `/bin` folder. Then, in terminal:

1. `cd path/to/bin`. Navigate to the bin folder
2. Then run these commands:
  - `make shp/il_legislative`
  - `make topo/il_congressional.json` or `make topo/il_senate.json` or `make topo/il_house.json`

### Push changes to GitHub

Once you're done running the scripts, you will see the new data as changes in GitHub for Windows.

- Add a commit message, such as "update vacancy data with new 2015 source".
- Toggle the button next to "Commit" so that it changes to "Commit & Sync"
- Click "Commit & Sync" to push changes live to the site.
