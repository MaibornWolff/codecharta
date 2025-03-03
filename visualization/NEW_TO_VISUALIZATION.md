# New to Visualization

The visualization opens a cc.json and displays a city-like landscape based on the folder structure.

### State Management

We use Redux to manage our state. This way we have a single state that allows us to have a single one-directional data flow at a time. Get familiar with the [core-concepts of redux](https://redux.js.org/introduction/core-concepts) and check out the chart below afterwards.

This chart shows the correct way to update the viewModel of a controller.

![redux](../gh-pages/assets/images/docs/reference/redux-flow.png)

This chart shows the data flow in our architecture when a new cc.json is opened.

![new-file-imported](../gh-pages/assets/images/docs/reference/loading-a-new-file-flow.png)

### Other Technologies

- Typescript
- npm
- Angular
- Jest (Unit Tests)
- Puppeteer (E2E Tests)
- ThreeJs for 3d visualization
- d3 for tree map algorithm and tree hierarchy (parent-child relations)
- Webpack
- electron
- Redux

### Important Concepts

- Dependency Injection
- Observer Pattern (`.subscribe(...)`)
- 2D Squarified TreeMap

### Building

There are 3 possible ways to build and run the application. You can run it as a developer with hot-code, which allows you to make changes in the code and see the results in your browser a few seconds later. But you can also build the application yourself and run it in a standalone or in the browser.

> Note that the `build` command requires unix tools on path, so on Windows add them to it or use the bash shell

- Development: `npm run dev`
- Standalone: `npm run build` -> `npm start`
- Web: `npm run build` -> Move the created content to a nginx server for example

### Testing

- Unit-Tests: `npm test`
- E2E-Tests: `npm run build && npm run e2e`
- For IntelliJ: Run -> Edit Configurations -> Templates -> Jest -> Add configuration file -> Select `jest.config.json` -> Add CLI argument `--env=jsdom`

For more test options check the `package.json`

<!-- ### Troubleshooting -->
