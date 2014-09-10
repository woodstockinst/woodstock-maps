## The site was built on a yeoman workflow:

`app`: for development
`dist`: for distribution, lives on `gh-pages` branch

If you are only updating the data without changing the site code, you probably don't have to worry about the `app` folder. You will be largely interfacing the scripts in the `bin` folder. See **README.md** for details.

## If you would like to develop the site:

1. `npm install`
2. `grunt serve` to live serve the site

## Sync with `gh-pages`:

1. `dist` is setup as a subtree folder, depolyed in `gh-pages`. When you are done building things in `app`. First run `git subtree pull --prefix origin gh-pages`. This will pull in the latest data changes applied directly to `gh-pages`.
2. `grunt build` to update the `dist` folder
3. Commit changes in master
4. `git subtree push --prefix dist origin gh-pages` to push the latest updates in `dist`
5. Push changes to master
