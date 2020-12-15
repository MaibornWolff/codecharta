# Publishing new version

## Automatic

### Prerequisites

-   `pip` command must be installed (it is probably already installed, if you have installed Python).
-   The python packaging tool must be installed. If not run `pip install pipenv` and then `pipenv install`.

### Start the automatic release process

-   Call `pipenv run make_release`.
-   Note, on Windows it is recommended to run the command in `cmd.exe` rather than in a git bash

## Manual

### Increment

To release a new version please modify the version property of the following files

-   analysis/build.properties
-   analysis/node-wrapper/package.json
-   visualization/package.json

### Changelog

Add a new release section in the changelog

### Tag

Commit your changes but do not push them. You need to tag your commit with the version number and then push both.
