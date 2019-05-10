# CodeCharta 
[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=master)](https://travis-ci.org/MaibornWolff/codecharta)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## Jump to Section

* [Installation](#installation)
* [Tasks](#tasks)
* [JSON structure](#json-structure)
* [URL Parameters](#url-parameters-used-by-the-web-application)
* [License](LICENSE.md)

## Installation
[[Back To Top]](#jump-to-section)

change working directory `cd <projectpath>/codecharta/visualization/`

#### Install application for desktop usage with npm

* install with `npm install codecharta-visualization -g`
* run with `codecharta-visualization`

#### Install application for desktop usage

* Download or build [latest version](https://github.com/MaibornWolff/codecharta/releases/latest) for your system. 
* Doubleclick the system specific Runnable. You may be required to give it executable rights. 

#### Install project for development

* Install node 8
* Install dependencies `npm install`.

Once you have installed the project, you can use all grunt tasks described in the next section.

#### Install web application on server

* Download or build latest web version.
* Copy all files (dist/app or the downloaded directory) to a served directory which is accessible from the internet.

## Tasks
[[Back To Top]](#jump-to-section)

#### Build

`npm run build` builds the project in dist/app. This artifact is ready to be served as a web application.
`npm run doc` generates the esdoc documentation in dist/doc/


#### Test

`npm run test` runs all unit tests on the source files in app/ and generates a coverage report in dist/coverage/.
`npm run e2e` runs all e2e tests on the built app in headless mode.

adding ":auto" to run target will run the tests in watch mode

#### Run

`npm run serve` starts a simple web server and serves the project on localhost:9000.
`npm run start` starts the nwjs app

#### Package

`npm run package` packages the nwjs app

#### Generate code

`npm run g` runs the code generation via plop.

You can generate the following modules:
 - "core module with empty service" - a core module with an empty service for business logic with all necessary files and tests
 - "ui module with empty component" - an ui module with an empty component and all necessary files and tests

## URL Parameters used by the web application
[[Back To Top]](#jump-to-section)

The web application allows the usage of two query parameters in the URL.
* `file` parameter can be used multiple times. Each accepts a file location, which must be reachable through XHR. 
With multiple `file` parameters you can load more than one map e.g. `http://localhost:3000/?file=firefox.json&file=firefox_comparison.json`
* `mode` parameter can be used to set one of the three different modes: `Single`, `Delta` or `Multiple`.
  * `Single` will only show the first imported files
  * `Delta` will show the first two imported files
  * `Multiple` will show all imported files aggregated together in one map

Query params are added by appending a `?` to the url, followed by a key value pair `key=value`. 
Additional parameters can be added by appending `&key2=value2`. See examples below:
* `http://yourdomain.com/pathtocc/index.html?file=something.json`
* `http://yourdomain.com/pathtocc/index.html?file=something.json&file=anotherFile.json&mode=Delta`
* `http://yourdomain.com/pathtocc/index.html?file=component1.json&file=component2.json&mode=Multiple`

## JSON structure
[[Back To Top]](#jump-to-section)

[Example Data](/visualization/app/codeCharta/assets/sample1.cc.json)

[JSON Schema](/visualization/app/codeCharta/util/schema.json)
