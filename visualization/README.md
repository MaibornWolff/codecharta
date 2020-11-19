# CodeCharta visualization

[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=main)](https://travis-ci.org/MaibornWolff/codecharta)

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

-   Install node >= 8
-   Install dependencies `npm install`.

Once you have installed the project, you can use all tasks described in the next section.

## Tasks

#### Build

`npm run build` builds the project in dist/app. This artifact is ready to be served as a web application.

#### Test

-   `npm run test` runs all unit tests on the source files in app/ and generates a coverage report in dist/coverage/.
-   `npm run e2e` runs all e2e tests on the built app in headless mode. **You have to stop your running dev-webserver and execute `npm run build:web` first**.
    To follow/watch the steps the e2e test is performing, deactivate headless mode in jest-puppeteer.config.js (and maybe set the slowMo parameter).

adding ":auto" to run target will run the tests in watch mode

#### Run

`npm run dev` starts a simple web server and serves the project on localhost:3000.
`npm run start` starts the nwjs app

#### Package

`npm run package` packages the nwjs app

#### Generate code

`npm run plop` runs the code generation via plop.

You can generate the following modules:

-   "state service" - an empty service with corresponding test file
-   "ui module" - an ui module with an empty component, all necessary files and tests
-   "util static class" - an empty static class with corresponding test file
-   "redux property" - a store property including actions, reducer, service and test files
-   "redux subreducer" - creates a subreducer like dynamicSettings

## JSON structure

[Example Data](/visualization/app/codeCharta/assets/sample1.cc.json)

[JSON Schema](/visualization/app/codeCharta/util/generatedSchema.json)
