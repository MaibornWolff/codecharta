# CodeCharta 
[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=master)](https://travis-ci.org/MaibornWolff/codecharta)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## Jump to Section

* [Installation](#installation)
* [Grunt Tasks](#grunt-tasks)
* [JSON structure](#json-structure)
* [License](LICENSE.md)

## Installation
[[Back To Top]](#jump-to-section)

#### Install application for desktop usage with npm

* install with `npm install @maibornwolff/codecharta-visualization -g`
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

## Grunt Tasks
[[Back To Top]](#jump-to-section)

#### Build

`npm run build` builds the project in dist/app. This artifact is ready to be served as a web application.
`npm run doc` generates the esdoc documentation in dist/doc/


#### Test

`npm run test` runs all unit tests on the source files in app/ and generates a coverage report in dist/coverage/.

#### Run

`npm run serve` starts a simple web server and serves the project on localhost:9000.
`npm run start` starts the nwjs app

#### Package

`npm run package` packages the nwjs app

#### Watch

`npm run watch:app` watches the app directory and triggers a quick rebuild.
`npm run watch:unit` watches the unit test directory and runs tests on change.

## URL Parameters used by the web application
[[Back To Top]](#jump-to-section)

The web application allows the usage of query parameters in the URL to set 
certain settings. Query params are added by appending a `?` to the url, 
followed by a key value pair `key=value`. Additional parameters can be 
added by appending `&key2=value2`. E.g. `http://yourdomain.com/pathtocc/index.html?file=something.json&scaling.x=2&areaMetric=myMetric`

* The `file` parameter is a special parameter which accepts a file location. The file must be reachable through XHR.
* All other parameters are defined by the [Settings class](/visualization/app/codeCharta/core/settings/model/settings.js). 
`areaMetric=myMetric` therefore sets the value of settings.areaMetric to `myMetric`. Nested properties like `settings.scale.x` can be 
set by the query parameter `scaling.x=42`
* The `map` parameter is disabled since it would be too much for the URL bar of your browser.
* The URL in your browser gets automatically updated when you change settings through the UI. 
It provides a simple way to customize your links with query parameters.

## JSON structure
[[Back To Top]](#jump-to-section)

[Example Data](/visualization/app/codeCharta/sample.json)

[JSON Schema](/visualization/app/codeCharta/core/data/schema.json)
