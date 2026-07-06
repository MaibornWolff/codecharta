---
title: "Versioning"
---

The CodeCharta version number is inspired by [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). The format is BREAKING.FEATURE.HOTFIX. We increment the

- BREAKING version when we make incompatible API changes
- FEATURE version when we add functionality in a backwards compatible manner
- HOTFIX version when we make backwards compatible bug fixes

But what is our API? For CodeCharta it is the `.cc.json` and to a lesser degree the interface of the analysis.

We'll increment the BREAKING version only if our `.cc.json` schema changes in a backwards-incompatible way. The BREAKING version tells you which files a given CodeCharta release is designed to read. Please note that the `.cc.json` has a FEATURE version separate from the analysis/visualization because we don't often add to its schema.

The `.cc.json` format is now at **2.0**. This was a breaking change: the shell (`ccsh`) reads and writes 2.0 only, so the command-line tools no longer read a 1.x file directly. To keep using older 1.x files — for example to merge them or run long-term delta compares — upgrade them once with [`ccsh convert`](/docs/filter/convert); afterwards they behave like any other 2.0 file. The visualization still opens both 1.x and 2.0 files directly. See [cc.json 2.0](/docs/filter/convert) for details.

We consider the analysis to also be an API, but one that is less protected. Don't expect a new BREAKING version should we ever change the ccsh parameters or remove an importer. We think that is acceptable because you probably only need to change a couple of words in your script if we change the ccsh slightly. This method leaves us flexible to correct unclear interfaces but still present a single version to users for both CodeCharta parts.

