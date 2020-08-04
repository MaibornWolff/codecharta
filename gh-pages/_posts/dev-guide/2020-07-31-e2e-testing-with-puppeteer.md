---
categories:
  - Dev-guide
tags:
  - puppeteer
  - e2e
  - testing
title: E2E Testing with puppeteer
---

# Introduction

[Puppeteer](https://github.com/puppeteer/puppeteer) is a headless Chrome Node.js API to execute actions on a wegpage and assert queries using jest. The tests can be run headless (in the background) or headful (opening a browser window and executing the actions live). Puppeteer provides an API that lets you select elements and interact with the html-template through selectors and events. Those actions are wrapped in a page-object (.po.ts)

# Running e2e tests

When you run e2e tests, puppeteers starts a html-server using the built application as it's entry point. In order to run the e2e tests, the application has to be built. Keep in mind that changing code in files, which change the outcome of the build, will require a rebuild of the application to test the new code. This includes all css, html and mostly all .ts-files (page-objects and test-files are excluded from the build and don't require a rebuild).

### IMPORTANT

- Do not run the dev-server while running e2e tests. They share the same build-folder and e2e tests are not executable from a dev-server compiled build.
- Do not run the tests in a console included in the IDE. I recommend using the git-bash.

### Running all e2e tests:

- `npm run build`
- `npm run e2e` for parallel or `npm run e2e:ci` for sequential execution

### Running individual e2e tests:

- Pass a pattern through the cli.

**Example**: `npm run e2e -- --testNamePattern fileChooser` will only execute tests that include "fileChooser" in the description.

### Debugging tests

- Execute tests headful
- Execute tests in slow-mo

_visualization/jest-puppeteer.config.js_

```js
module.exports = {
  launch: {
    headless: true,
    args: ["--allow-file-access-from-files", "--start-maximized"],
    defaultViewport: { width: 1920, height: 1080 },
    // slowMo: 250
  },
};
```

- Pipe console.logs from the browser to the terminal (Run `enableConsole()` from the `puppeteer.helper.ts` in a test).

# Writing e2e tests

## Page-Objects

Writing and maintaining e2e-tests can be tedious. Selectors, such as classNames and ids may change and tests need to be adapted. In order to minimize changes across files, we introduce Page-Objects (.po.ts) to wrap our selectors and build our own API to the component.

**Rule of thumb:** Never use selectors or calls to the page-object in the .e2e.ts-file. Always move them to the page-object.

Example:

```ts
public async clickChooser() {
	await expect(page).toClick("file-panel-component md-select", { timeout: 3000 })
}
```

Instead of working on the page directly, we can call this methods on the fileChooser-page-object in our test. If we change the name of the component, we only have to adapt the page-object instead of all the tests calling this method.

```ts
describe("MapTreeViewLevel", () => {
  let mapTreeViewLevel: MapTreeViewLevelPageObject;
  let searchPanelModeSelector: SearchPanelModeSelectorPageObject;
  let nodeContextMenu: NodeContextMenuPageObject;

  beforeEach(async () => {
    // Setting up page-objects
    mapTreeViewLevel = new MapTreeViewLevelPageObject();
    searchPanelModeSelector = new SearchPanelModeSelectorPageObject();
    nodeContextMenu = new NodeContextMenuPageObject();

    // refreshing the page before every test
    await goto();
  });

  describe("Blacklist", () => {
    it("excluding a building should exclude it from the tree-view as well", async () => {
      const filePath = "/root/ParentLeaf/smallLeaf.html";

      // only use page-object-functions to execute actions / events on the webpage
      await searchPanelModeSelector.toggleTreeView();
      await mapTreeViewLevel.openFolder("/root/ParentLeaf");
      await mapTreeViewLevel.openContextMenu(filePath);
      await nodeContextMenu.exclude();

      // use page-object-functions to get some state to verify
      expect(await mapTreeViewLevel.nodeExists(filePath)).toBeFalsy();
    });
  });
});
```

## Setup and teardown

Usually you'd have to setup the server, browser and page yourself. Luckily [jest-puppeteer](https://github.com/smooth-code/jest-puppeteer) provides global variables, such as `page` and automatically handles the setup and teardown for us. No need for boilerplate code in our tests.

## Stability

Running e2e-tests can lead to timeouts and race conditions depending on how fast your pc is. This can be quite frustrating across multiple developers and a CI. Therefore increasing the stability is very important to prevent the tests from failing randomly.

**Common reasons the test is failing**

- Trying to access a selector that is not available (yet)
- Accessing an old selector and using the data to verify something (reading old classNames and expecting a new className to be set)
- Fixed delays by calling `waitFor(1000) // wait for 1000ms`

**Best practices**

- Before accessing a selector, wait until it's available using `await page.waitForSelector(MY_SELECTOR)`
- When clicking a button, use `expect(page).toClick(MY_SELECTOR, { timeout: 3000 })`. This function awaits the selector for 3s before throwing an error
- After clicking a button or changing the state, use `waitForSelector()` to verify, that the new state is rendered before continuing

## Most used functions

- `page.waitForSelector(MY_SELECTOR)` to avoid race conditions
- `page.waitForSelector(MY_SELECTOR, { visible: false })` to check, if a HTMLElement is not visible through css (ng-show)
- `page.waitForSelector(MY_SELECTOR, { hidden: true})` to check, if a HTMLElement is not in the DOM (ng-if)
- `expect(page).toClick()` or `expect(page).toClick({ button: "right" })` to click on something
- `page.$eval(SELECTOR, el => el[ATTRIBUTE])` to evaluate one HTMLElement and returning the attribute. Example: `page.$eval(SELECTOR, el => el.className)`
- `page.$$eval(SELECTOR, elements => elements.map(x => x[ATTRIBUTE]))` to evaluate multiple HTMLElements and returning the attributes in an array. Mostly used when evaluating a list (like the metrics in the dropdown)
