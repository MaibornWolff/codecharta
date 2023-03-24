# CodeCharta Visualization

[![Build Status](https://travis-ci.org/MaibornWolff/codecharta.svg?branch=main)](https://travis-ci.org/MaibornWolff/codecharta)

> CodeCharta by [MaibornWolff](https://www.maibornwolff.de)

## Jump to Section

-   [Installation](#installation)
-   [Development Tasks](#tasks)
-   [Testing](#testing)
-   [JSON structure](#json-structure)
-   [License](LICENSE.md)

# Installation

You can start with **Codecharta Visualization** on multiple ways:

-   Installation as a [npm package](#npm-package) (Recommended)
-   Run an operating system specific [standalone](#run-a-standalone)
-   Build it yourself from the github [repository](#build-it-yourself)
-   Try out the [online version](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json&file=codecharta_analysis.cc.json)

> Be aware, that if you are on Apple Silicon, you need to do additional config for npm installation

## NPM Package

> Make sure you have [Node.js](https://nodejs.org/en/download) (version >=16) installed <br>
> For reference: [Codecharta-Visualization on NPM](https://www.npmjs.com/package/codecharta-visualization)

```bash
# Install the package globally via npm
# If you're on Apple Silicon (M1 or similar), you have to run `npm_config_nwjs_process_arch=x64 npm i -g codecharta-visualization` instead (see https://github.com/nwjs/npm-installer/issues/83)
$ npm i -g codecharta-visualization
# Run it anywhere (you might need administrative rights/sudo)
# You might need to restart your terminal
$ codecharta-visualization
```

## Run a standalone

-   Download the correct standalone version for your OS from the [latest release page](https://github.com/MaibornWolff/codecharta/releases) under 'Assets'
-   Extract & run the application

> If you get an error on MacOS because of a missing license, try this [apple support article](https://support.apple.com/en-gb/guide/mac-help/mh40616/12.0/mac/12.0) <br>
> You may be required to give the application executable rights

## Build it yourself

> To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (version >=16) installed

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

### Tasks

After cloning the repository and running the installation as described above, you can use the other available commands and tasks inside the visualization project:

#### Build

Build the project in `dist/`. The produced files are required if you want to [package](#package) the application or [start](#start) the standalone version.

```bash
# Make sure you are still inside the visualization project
$ cd visualization
# Build the webpack without serving it
$ npm run build
# The webpack is inside the dist/webpack/ folder, which you can serve as a web application
```

#### Package

Package the nwjs application to produce the standalone versions for Windows (32bit/64bit), Linux (32bit/64bit) and MacOS (64bit) for distribution and testing. Creates `.zip` files for every OS and the webpack in the `dist/packages/` folder.

> Make sure to run the [build](#build) task beforehand <br>
> This process might require administrative rights/sudo depending on the OS <br>
> For UNIX-based systems you need to install [Wine](https://www.winehq.org/) to package the Windows application <br>
> Currently the MacOS version can't be packaged while using Windows (see `sript/build-nwjs.js`)

```bash
# You might need to edit the build script before you start
$ npm run package
```

#### Dev

```bash
# Build the weebpack and serve it under localhost:3000
$ npm run dev
# This server listens to file changes
```

#### Start

> Make sure to run [build](#build) beforehand

```bash
# Start the nwjs application
$ npm run start
```

<hr>

### Testing

To run tests check out the following **tasks**:

#### Unit

Run unit tests in `app/` and generate a coverage report in `dist/coverage/`.

```bash
$ npm run test
# To run the tests in watch mode, use
$ npm run test:auto
```

#### E2E

Run end-to-end tests

```bash
# Make sure to stop the dev-webserver before continuing
# Create an up-to-date build
$ npm run build
# Start the e2e tests
$ npm run e2e
# To run the tests in watch mode, use
$ npm run e2e:auto
```

> To follow/watch the steps the e2e test is performing, deactivate headless mode in `jest-puppeteer.config.js` (and maybe set the `slowMo` parameter)

# JSON structure

[Example Data](/visualization/app/codeCharta/assets/sample1.cc.json)

[JSON Schema](/visualization/app/codeCharta/util/generatedSchema.json)
