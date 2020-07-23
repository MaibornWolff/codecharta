# CodeCharta visualization

[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=master)](https://travis-ci.org/MaibornWolff/codecharta)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## Jump to Section

-   [Installation](#installation)
-   [Tasks](#tasks)
-   [JSON structure](#json-structure)
-   [License](LICENSE.md)

## Installation

Change working directory `cd <projectpath>/codecharta/visualization/`

#### Install application for desktop usage with npm

-   install with `npm install codecharta-visualization -g`
-   run with `codecharta-visualization`

#### Install application for desktop usage

-   Download or build [latest version](https://github.com/MaibornWolff/codecharta/releases/latest) for your system.
-   Doubleclick the system specific Runnable. You may be required to give it executable rights.

#### Install project for development

-   Install node 8
-   Install dependencies `npm install`.

Once you have installed the project, you can use all grunt tasks described in the next section.

#### Install web application on server

-   Download or build latest web version.
-   Copy all files (dist/app or the downloaded directory) to a served directory which is accessible from the internet.

## Tasks

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

-   "state service" - an empty service with corresponding test file
-   "ui module component" - an ui module with an empty component, all necessary files and tests
-   "util static class" - an empty static class with corresponding test file

## JSON structure

[Example Data](/visualization/app/codeCharta/assets/sample1.cc.json)

[JSON Schema](/visualization/app/codeCharta/util/generatedSchema.json)
