# Publishing new version

1. [Run the release script to release a new version. It will do everything necessary for you.](#run-release-script)
1. [Perform all steps manually by yourself.](#release-manually)

## Run release script

### Prerequisites

-   `pip` command must be installed (it is probably already installed, if you have installed Python).
-   The python packaging tool must be installed. If not run `pip install pipenv` and then `pipenv install`.

### Start the automatic release process

-   Call `pipenv run make_release`.
-   On Windows it is recommended to run the command in `cmd.exe` rather than in a git bash.
-   Note that you have to add the Changelog notes manually on GitHub (GitHub > Latest (new) release > Edit).

### Explanation of the script

-   The script will ask you what version you want to increase (major, minor, patch). Read the [Versioning Strategy Guide](https://maibornwolff.github.io/codecharta/docs/versioning/) first.
-   The version number will be updated automatically in corresponding files (see the manual guide for which files [will be updated](#increment-version-numbers)).
-   The Changelog section `[unreleased]` will be renamed to the release date like e.g. `[2020-12-12]` and a new `[unreleased]` section will be added on top of the Changelog.
-   A release post will be created for the GitHub Pages with the corresponding release notes from the Changelog.
-   You will be ask if you want to commit and tag the automatically changed files and thus, the release itself.
-   Then you will be ask if you want to push the release commits finally.
-   Our build pipeline will detect the new release (tag) and starts a build to publish the new release as npm packages on npmjs.com

## Release manually

### Increment version numbers

To release a new version please modify the version property of the following files

-   analysis/gradle.properties
-   analysis/build.properties
-   analysis/node-wrapper/package.json
-   analysis/node-wrapper/package-lock.json
-   visualization/package.json
-   visualization/package-lock.json
-   CHANGELOG.md
-   Add release post: /gh-pages/\_posts/release/YYYY-mm-dd-v<YOUR.NEW.VERSION>.md

### Update the Changelog

Add a new release section in the changelog

### Tag the new release

Commit your changes but do not push them. You need to tag your commit with the version number and then push both.
