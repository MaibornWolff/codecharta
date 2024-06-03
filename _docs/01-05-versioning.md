---
permalink: /docs/versioning/
title: "Versioning"
---

The CodeCharta version number is inspired by [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). The format is BREAKING.FEATURE.HOTFIX. We increment the

- BREAKING version when we make incompatible API changes
- FEATURE version when we add functionality in a backwards compatible manner
- HOTFIX version when we make backwards compatible bug fixes

But what is our API? For CodeCharta it is the `.cc.json` and to a lesser degree the interface of the analysis.

We'll increment the BREAKING version only if our `.cc.json` schema changes in a backwards-incompatible way. That means analysis version 1.x as well as visualization version 1.x will always work with a `.cc.json` version 1.x. For example a file you generated 2017 can still be compared or merged with a file from 2019 and you are able to do long-term delta compares. Please note that the `.cc.json` has a FEATURE version separate from the analysis/visualization because we don't often add to its schema.

We consider the analysis to also be an API, but one that is less protected. Don't expect a new BREAKING version should we ever change the ccsh parameters or remove an importer. We think that is acceptable because you probably only need to change a couple of words in your script if we change the ccsh slightly. This method leaves us flexible to correct unclear interfaces but still present a single version to users for both CodeCharta parts.
