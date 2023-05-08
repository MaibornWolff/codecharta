---
permalink: /docs/new-to-code-visualization/
title: "New to Visualization?"
---

# Visualization

The visualization opens a cc.json and displays a city-like landscape based on the folder structure.

### State Management

We use Redux to manage our state. This way we have a single state that allows us to have a single one-directional data flow at a time. Get familiar with the [core-concepts of redux](https://redux.js.org/introduction/core-concepts) and check out the chart below afterwards.

This chart shows the correct way to update the viewModel of a controller.

![redux]({{site.baseurl}}/assets/images/docs/reference/redux-flow.png)

This chart shows the data flow in our architecture when a new cc.json is opened.

![new-file-imported]({{site.baseurl}}/assets/images/docs/reference/loading-a-new-file-flow.png)

### PlopJS

In order to reduce the amount of time spent on repetitive work such as creating 5 files for an ui-component, we implemented some plop-templates that will help you with that. Just type `npm run plop` and let the magic take over.

Currently, we support the creation of:

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
-   Web: `npm run build` -> Move the created content to a nginx server for example

### Testing

-   Unit-Tests: `npm test`
-   E2E-Tests: `npm run build && npm run e2e`
-   For IntelliJ: Run -> Edit Configurations -> Templates -> Jest -> Add configuration file -> Select `jest.config.json` -> Add CLI argument `--env=jsdom`

For more test options check the `package.json`
