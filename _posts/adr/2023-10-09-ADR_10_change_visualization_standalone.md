---
categories:
  - ADR
tags:
  - visualization
  - nw
  - nwjs
  - electron
  - npm
  - standalone
  - package
title: "ADR 10: Change Visualization Standalone -  Electron & NW.JS"
---

If users want to use CodeCharta Visualization without a browser installed they can use the `npm start` option inside the repository or install it via `npm` and execute it via `codecharta-visualization`.
For this standalone use-case (like a desktop app without an installer) there are several options to choose from, the biggest beeing [electron](https://github.com/electron/electron) and [NW.JS](https://nwjs.io/). Both frameworks can be used with a variety of _packagers_, which automate the process to build a standalone version.

NW is used for the most releases including and prior to version `1.119.1`, but itself and its _packagers_ are the source of isssues regulary.

- [NW app completly unusable in release version](https://github.com/nwjs/nw.js/issues/7963)
- [Dependency not available anymore](https://github.com/MaibornWolff/codecharta/pull/3314), so CodeCharta could not be installed
- [Pheonix builder stops working with new nw-versions](https://github.com/MaibornWolff/codecharta/issues/1266)
- [Swap to nwjs-builder](https://github.com/MaibornWolff/codecharta/issues/2823), because pheonix was not maintained anymore

To avoid these issues there are two options:

1.  Swap to electron
2.  Stay with nwjs, (requires to) develop own package and build scripts to eliminate some of the problems and security risks from old dependencies

# Status

accepted 1.

# Decision & Consequences

1. Use the _electron_ framework for standalone CodeCharta-Visualization
2. Use the [electron-packager](https://github.com/electron/electron-packager) to produce all available combinations of OS and architectures
3. Zip the results like previously and add them as assets to releases.

Because we did not use any features of the nwjs standalone framework, we don't need to adapt or change anything, besides the call in the `package.json` and some adjustments are needed in the github release action.
