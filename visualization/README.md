# CodeCharta visualization

[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=main)](https://travis-ci.org/MaibornWolff/codecharta)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## Jump to Section

-   [Installation](#installation)
-   [Tasks](#tasks)
-   [JSON structure](#json-structure)
-   [License](LICENSE.md)

# Installation

You can start with **Codecharta Visualization** on multiple ways:

-   Installation as a npm package (Recommended)
-   Run an operating system specific standalone
-   Build it yourself from the github repository

## NPM Package

> Make sure you have [Node](https://nodejs.org/en/) installed

```bash
# Install the package globally via npm
$ npm i -g codecharta-visualization
# Run it anywhere
$ codecharta-visualization
# (You might need to restart your terminal)
```

## Run a standalone

Download the correct

First, change working directory via

`cd <projectpath>/codecharta/visualization/`

## Install for desktop usage with npm

Install with

`npm install codecharta-visualization -g`

then run

`codecharta-visualization`

## Install for desktop usage

Download or build [latest version](https://github.com/MaibornWolff/codecharta/releases/latest) for your system.
Then Doubleclick the system specific Runnable. You may be required to give it executable rights.

(If you get an error on macOS because of a missing license, try https://support.apple.com/en-gb/guide/mac-help/mh40616/12.0/mac/12.0).

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed. From your command line run:

```bash
# Clone the CodeCharta repo
$ git clone https://github.com/MaibornWolff/codecharta.git
# Navigate to Visualization
$ cd codecharta/visualization
# Installation. If you're on Apple Silicon, you have to do `npm_config_nwjs_process_arch=x64 npm install` instead (see https://github.com/nwjs/npm-installer/issues/83).
$ npm install
# Run the development server
$ npm run dev
# Upload any .cc.json!
```

## Install for development

Make sure you have node >= 8 installed. Then run

`npm install`

Once you have installed the project, you can use all tasks described in the next section.

# Tasks

## Build

Build the project in dist/app via

`npm run build`

The resulting artifact is ready to be served as a web application.

## Test

### Unit

Run unit tests in app/ and generate a coverage report in dist/coverage/ via

`npm run test`

To run the tests in watch mode, use

`npm run test:auto`

### E2E

First, you have to stop your running dev-webserver and execute

`npm run build`

Then, run the e2e-tests on the fresh build via

`npm run e2e`

To run the tests in watch mode, use

`npm run e2e:auto`

To follow/watch the steps the e2e test is performing, deactivate headless mode in jest-puppeteer.config.js (and maybe set the slowMo parameter).

## Run

### Development

Serve the project on localhost:3000 via

`npm run dev`

### Production

First, build via

`npm run build`

and then start the nwjs app via

`npm run start`

### Package

Package the nwjs app via

`npm run package`

If you get WrapperError on macOS:

Try to use Homebrew by running `brew install --cask wine-stable`, then try `npm run package` again.

# JSON structure

[Example Data](/visualization/app/codeCharta/assets/sample1.cc.json)

[JSON Schema](/visualization/app/codeCharta/util/generatedSchema.json)
