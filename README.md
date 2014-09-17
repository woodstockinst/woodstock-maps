Woodstock Map Browser
---

This map browser presents data for foreclosure, mortgage, income, jobs, and employment in Illinois. This documentation walks you through the setup of your system and the data update procedures.

### Configure your Windows environtment

- Follow the instructions [in the wiki](https://github.com/woodstockinst/woodstock-maps/wiki/1.-Configure-Your-Windows-Environment)

### Configure GitHub ssh key

- Once you've installed Python, Git and Node on your computer, [follow the instruction](https://help.github.com/articles/generating-ssh-keys#platform-windows) to configure your SSH key for using GitHub.

### Site configuration (do this once):

- Navigate to a folder where you will have the site files directly
- `git clone git@github.com:woodstockinst/woodstock-maps.git`
- `npm install`

## Update numeric and geographic data

The steps for updating numeric data and some geographic data are documented in the wiki of this repository:

- [Update numeric data](https://github.com/woodstockinst/woodstock-maps/wiki/2.-Update-numeric-data)
- [Update geographic data](https://github.com/woodstockinst/woodstock-maps/wiki/3.-Update-geographic-data)

## Push data changes to GitHub

1. Run respective script
2. `grunt build`
3. `git add app dist`
4. `git commit -m "update data with your-message-here"`
5. `git subtree push --prefix dist origin gh-pages` - updates front-facing site
6. `git push origin master` - updates master branch
