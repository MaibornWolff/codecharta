# CodeCharta Visualization

[![Quality Gate Status For Visualization](https://sonarcloud.io/api/project_badges/measure?project=maibornwolff-gmbh_codecharta_visualization&metric=alert_status)](https://sonarcloud.io/project/overview?id=maibornwolff-gmbh_codecharta_visualization)

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
-   Use [docker-compose](https://maibornwolff.github.io/codecharta/docs/docker-containers/) to run this with other needed tools like a Sonar instance or analyzing tools of codecharta-analysis.
-   Use our [Dockerfile](#run-in-docker-container) to run the visualization in a container
-   Try out the [online version](https://maibornwolff.github.io/codecharta/visualization/app/index.html?file=codecharta.cc.json&file=codecharta_analysis.cc.json)

> Be aware, that if you are on Apple Silicon, you may run into problems with the standalone and build versions

## NPM Package

> Make sure you have [Node.js](https://nodejs.org/en/download) (version >=16) installed <br>
> For reference: [Codecharta-Visualization on NPM](https://www.npmjs.com/package/codecharta-visualization)

```bash
# Install the package globally via npm
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
# Installation.
$ npm install
# Run the development server
$ npm run dev
# Upload any .cc.json!
```

### Tasks

After cloning the repository and running the `npm` installation as described above, you can use the other available commands and tasks inside the visualization project. You can check all tasks and their functionality inside the `package.json` section `scripts`.

#### Build

Build the project in `dist/webpack`. The produced files are required if you want to [package](#package) the application or [start](#start) the standalone version.

> Additional files are copied inside the webpack, which are required to execute the electron standalone via npm (run) start
> Note that the `build` command requires unix tools on path, so on Windows add them to it or use the bash shell

```bash
# Make sure you are still inside the visualization project
$ cd visualization
# Build the webpack without serving it
$ npm run build
# The webpack is inside the dist/webpack/ folder, which you can serve as a web application
```

#### Package

**Package** the electron application to produce the standalone versions for Windows, Linux and MacOS for distribution and testing. The different versions are inside the `dist/applications` folder.

> Make sure to run the [build](#build) task beforehand <br>
> This process might require administrative rights/sudo depending on the OS <br>
> For UNIX-based systems you probably need to install [Wine](https://www.winehq.org/) to package the Windows application <br>
> The MacOS version usually can't be packaged while using Windows

```bash
$ npm run package
# If you only want to produce the standalone version for your current OS/arch combo use package:local
$ npm run package:local
```

For distribution the different application folders they need to be zipped. This command creates a `.zip` compressed file for every folder inside `dist/applications` and puts them in the `dist/packages` folder:

```bash
# You may not be able to zip every OS/arch combo on every OS. You might need to adjust the script/package-zips.js for your usage.
$ npm run package:zip
```

#### Dev

```bash
# Build the webpack and serve it under localhost:3000
$ npm run dev
# This server listens to file changes
```

#### Start

> Make sure to run [build](#build) beforehand

```bash
# Start the electron application
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

## Run in Docker container

You can use this via docker compose or as a standalone container. This section will deal with how to use the visualization as a standalone container. For information on how to use this with docker compose, please check out [Docker Getting Started](https://maibornwolff.github.io/codecharta/docs/docker-containers/)
We assume that you already installed docker, if not, you have to do that before!

To containerize the visualization, please follow the below listed steps.

-   Start the docker container: `docker run -d -p 9000:80 codecharta/codecharta-visualization`. This detaches the container and exposes port 80 on the container and port 9000 on the host.
-   Open `localhost:9000` in your browser and you can already use the visualization, upload `cc.json` files and play around!

# JSON structure

[Example Data](/visualization/app/codeCharta/assets/sample1.cc.json)

[JSON Schema](/visualization/app/codeCharta/util/generatedSchema.json)
