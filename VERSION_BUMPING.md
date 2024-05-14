# Publishing new version

## Prerequisites

-   `pip` command must be installed (it is probably already installed, if you have installed Python).
-   The python packaging tool must be installed. If not run `pip install pipenv` and then `pipenv install`.

> Be aware, that the current version of analysis must be able to analyse the repository as described in `script/build_demo_file_*.sh`! Do not try to release the visualization, when analysis is broken!

## Start the automatic release process

-   Call `pipenv run make_release`.
-   On Windows it is recommended to run the command in `cmd.exe` rather than in a git bash.
-   Note that you have to add the Changelog notes manually on GitHub (GitHub > Latest (new) release > Edit).

> You can add `-f` or `--force` to disable the protections of the script. You can't release in force mode.

## Explanation of the script

-   The script will ask you what version you want to increase (major, minor, patch). Read the [Versioning Strategy Guide](https://maibornwolff.github.io/codecharta/docs/versioning/) first.
-   The version number will be updated automatically in corresponding files.
-   The Changelog section `[unreleased]` will be renamed to the release date like e.g. `[2020-12-12]` and a new `[unreleased]` section will be added on top of the Changelog.
-   A release post will be created for the GitHub Pages with the corresponding release notes from the Changelog.
-   You will be asked if you want to commit and tag the automatically changed files and thus, the release itself.
-   Then you will be asked if you want to push the release commits finally.
-   Our build pipeline will detect the new release (tag) and starts a build to publish the new release as npm packages on npmjs.com
