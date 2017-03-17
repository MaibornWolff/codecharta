# CodeCharta 
[![Build Status](https://secure.travis-ci.org/some-name/CodeCharta.png?branch=master)](http://travis-ci.org/some-name/CodeCharta)

> MaibornWolff CodeCharta

## Jump to Section

* [Installation](#installation)
* [Grunt Tasks](#grunt-tasks)
* [JSON structure](#json-structure)
* [License](LICENSE.md)

## Installation
[[Back To Top]](#jump-to-section)

#### Install application for desktop usage

* Download or build latest version for your system. 
* Doubleclick the system specific Runnable. You may be required to give it executable rights. 

#### Install project for development

* Install node 6
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

## JSON structure
[[Back To Top]](#jump-to-section)

[Example Data]("/app/codeCharta/sample.json")

[JSON Schema]("/app/codeCharta/core/data/schema.json")
