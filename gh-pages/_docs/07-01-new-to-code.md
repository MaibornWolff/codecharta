---
permalink: /docs/new-to-code/
title: "New to this Code?"
---

Thank you for being interested in CodeCharta. You should first familiarize yourself with the [quick-start guide]({{site.baseurl}}{% link _docs/01-01-quick-start-guide.md %}), and the difference between [analysis]({{site.baseurl}}{% link _docs/05-01-analysis.md %}) and the [visualization]({{site.baseurl}}{% link _docs/06-01-visualization.md %}). Afterwards it makes sense to check the [architecture decision records (ADR)]({{site.baseurl}}/categories/#adr) to get up to speed with the decisions we have made so far. It's also important to know that CodeCharta uses [two different tech stacks]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_1_decide_tech_stack.md %}) for analysis and visualization.

Finally, it would be great if you looked at how we give and receive [feedback]({{site.baseurl}}{% link _docs/01-07-feedback.md %}) and after finishing this entire post, please explore our [developer guides]({{site.baseurl}}/categories/#dev-guide).

# Branching / Releasing

We create Pull Requests to the `main` branch after implementing a feature or fixing a bug. There is no release or development branch. We never push on `main` directly. Please take a look at our [contributing guidelines](https://github.com/MaibornWolff/codecharta/blob/main/CONTRIBUTING.md) before you start comitting.

# Travis CI

In Travis CI, we defined stages, which group different jobs. Inside a stage, all jobs run in parallel. There is no data persistence between stages, so we have to rebuild our application in each stage. The CI consists of the following stages:

-   Testing (which runs all the time)
-   Sonar (only run when a PR is merged into `main`)
-   Deploy (run by `make_release.py`)

### Testing

-   Runs Unit and E2E/UI-Tests

### Sonar

-   Publishes Sonar-Analysis-Results to [Sonarcloud.io](https://sonarcloud.io)

### Deploy

-   Deploys the application in a docker container to the github-pages
-   Publishes the new version on npm
-   Publishes a docker container on [Docker Hub](https://hub.docker.com/r/codecharta/codecharta-visualization)

# Analysis

The analysis is a CLI to import, export or filter from all kind of resources.

### Importing the Project

Don't import the whole codecharta project to IntelliJ when working on the analysis. Simply import the analysis folder for that. IntelliJ might not able to identify it as a Gradle project otherwise.

### Definitions

#### Importer

-   Retrieves metrics from external sources, such as `SonarQube` and creates a `cc.json`.

#### Exporter

-   Consumes a cc.json and creates another format, such as CSV

#### Filter

-   Consumes a cc.json and creates another cc.json. A common use case is merging two cc.jsons

### Technologies

-   [Kotlin]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_2_pick_analysis_language.md %})
-   Gradle
-   [PicoCli]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_5_pick_analysis_cli_library.md %})
-   JUnit
-   Hamcrest
-   Mockito
-   Gson
-   Sonar-Plugins to create our own parsers

### Concepts

-   [Pipes and filters architecture]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_4_decide_analysis_architecture.md %})
-   Shared nothing importers.

### Building

-   `gradlew.bat build` or `./gradlew build`
-   Navigate to `build/distributions` and unzip the zip-folder
-   Navigate to the `build/distributions/codecharta-analysis-VERSION/bin` and execute the ccsh

### Testing

-   Run `gradlew.bat test` or `./gradlew test`
-   Run `gradlew.bat integrationTest` or `./gradlew integrationTest`

May the integration tests will fail because of missing or unknown `sh` command.
To make it work you could add the path to the Git `sh.exe` (which is normally placed here `C:\<path-to-git>\Git\bin`) to your PATH variable.

**If you want to run the JUnit tests with the IntelliJ-Runner, make sure to go to `File -> Settings ->Build,Execution, Deployment -> Build Tools -> Gradle` and select `Run test using: IntelliJ IDEA`**

### Linting/Formatting

-   `gradlew.bat ktlintApplyToIdea` or `./gradlew ktlintApplyToIdea` (tested in IntelliJ)

# Visualization

The visualization opens a cc.json and displays a city-like landscape based on the folder structure.

### State Management

We use Redux to manage our state. This way we have a single state that allows us to have a single one-directional data flow at a time. Get familiar with the [core-concepts of redux](https://redux.js.org/introduction/core-concepts) and check out the chart below afterwards.

This chart shows the correct way to update the viewModel of a controller.

![redux]({{site.baseurl}}/assets/images/docs/reference/redux-flow.png)

This chart shows the data flow in our architecture when a new cc.json is opened.

![new-file-imported]({{site.baseurl}}/assets/images/docs/reference/loading-a-new-file-flow.png)

### PlopJS

In order to reduce the amount of time spent on repetitive work such as creating 5 files for a ui-component, we implemented some plop-templates that will help you with that. Just type `npm run plop` and let the magic take over.

Currently we support the creation of:

-   state service
-   ui-component
-   util static class
-   redux property
-   redux sub-reducer

### Other Technologies

-   [Typescript]({{site.baseurl}}{% link _posts/adr/2017-09-03-ADR_7_pick_visualization_language.md %})
-   npm
-   AngularJs 1.x, specifically what are Components, Services
-   Jest (Unit Tests)
-   Puppeteer (E2E Tests)
-   ESLint
-   ThreeJs for 3d visualization
-   d3 for tree map algorithm and tree hierarchy (parent-child relations)
-   Webpack
-   nwjs
-   Redux

### Important Concepts

-   Dependency Injection
-   Observer Pattern (`.subscribe(...)`)
-   2D Squarified TreeMap

### Building

There are 3 possible ways to build and run the application. You can run it as a developer with hot-code, which allows you to make changes in the code and see the results in your browser a few seconds later. But you can also build the application yourself and run it in a standalone or in the browser.

-   Development: `npm run dev`
-   Standalone: `npm run build` -> `npm start`
-   Web: `npm run build:web` -> Move the created content to a nginx server for example

### Testing

-   Unit-Tests: `npm test`
-   E2E-Tests: `npm run build && npm run e2e`
-   For IntelliJ: Run -> Edit Configurations -> Templates -> Jest -> Add configuration file -> Select `jest.config.json` -> Add CLI argument `--env=jsdom`

For more test options check the `package.json`
