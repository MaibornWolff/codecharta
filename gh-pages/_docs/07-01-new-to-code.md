---
permalink: /docs/new-to-code/
title: "New to this Code?"
---

Thank you for being interested in CodeCharta. You should first familiarize yourself with the [quick-start guide]({{site.baseurl}}{% link _docs/01-01-quick-start-guide.md %}), and the difference between [analysis]({{site.baseurl}}{% link _docs/05-01-analysis.md %}) and the [visualization]({{site.baseurl}}{% link _docs/06-01-visualization.md %}). Afterwards it makes sense to check the [architecture decision records (ADR)](http://localhost:4000/categories/#adr) to get up to speed with the decisions we have made so far. It's also important to know that CodeCharta uses [two different tech stacks]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_1_decide_tech_stack.md %}) for analysis and visualization.

Finally it would be great if you looked at how we give and receive [feedback]({{site.baseurl}}{% link _docs/01-07-feedback.md %}). If you want to contribute you should check our [CONTRIBUTING.md](https://github.com/MaibornWolff/codecharta/blob/master/CONTRIBUTING.md) and see what naming conventions branches and commit messages use.

# Analysis

## Important Tech

- [Kotlin]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_2_pick_analysis_language.md %})
- [PicoCli]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_5_pick_analysis_cli_library.md %})

## Important Concepts

- [Pipes and filters architecture]({{site.baseurl}}{% link _posts/adr/2017-01-02-ADR_4_decide_analysis_architecture.md %})
- Shared nothing importers.

# Visualization

## Important Tech

- [Typescript]({{site.baseurl}}{% link _posts/adr/2017-09-03-ADR_7_pick_visualization_language.md %})
- npm
- plopjs
- AngularJs 1.x, specifically what are Components, Services
- Jest for tests. Tip: Jest can mock everything
- ThreeJs for 3d visualization
- d3 for tree map algorithm and tree hierarchy (parent-child relations)
- webpack for packing
- nwjs

## Important Concepts

- Dependency Injection
- Observer Pattern (`.subscribe(...)`)
- 2D Squarified TreeMap

## Coding Conventions from ts-lint:

- variables with an `_` (underscore) before its name e.g. `_myVariable` is ignored by the _no unused vars_ linting rule. Reason: angular uses some variables in html templates. The linter does not recognize them as used.
- Tip: You can inject services like `fooService` or with `_fooService_`. This is helpful when injecting services which only get used in the template. Example: `constructor(private _myService_ : MyService) ... // linting succeeds`, devs "know" it is template bound
- template bound variables should be prefixed with an `_` (underscore)
- NearW: functions with no member-access are declared `public` now (they were `public` by default before anyway). Inform team to check files from time to time, if some functions can be declared private
