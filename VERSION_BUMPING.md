# Publishing new version

## Automatic

Call `script/make_release.py`.

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
