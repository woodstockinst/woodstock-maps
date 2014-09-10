Woodstock Map Browser
---

This map browser presents data for foreclosure, mortgage, income, jobs, and employment in Illinois.

## How do you maintain the site

### Configure environment for python, git and node:

1. Python
  - install
2. Git
  - install 
  - [Follow the instruction]() to configure your SSH key for using GitHub.
3. Node
  - install
4. GNU Make
  - install

### Site configuration (do this once):
  - Navigate to a folder where you will have the site files directly
  - `git clone git@github.com:woodstockinst/woodstock-maps.git`
  - `npm install`

## Update numeric and geographic data

The steps for updating numeric data and some geographic data are documented in the wiki of this repository:

- [Update numeric data](https://github.com/woodstockinst/woodstock-maps/wiki/Update-numeric-data)
- [Update geographic data](https://github.com/woodstockinst/woodstock-maps/wiki/Update-geographic-data)

## Push data changes to GitHub

1. Run respective script
2. `grunt build`
3. `git add app dist`
4. `git commit -m "update data with your-message-here"`
5. `git subtree push prefix dist origin gh-pages` - updates front-facing site
6. 'git push origin master' - updates master branch
