Here is a polished version of your readme that keeps your original content and intent while making it a bit clearer and easier to scan.

2DTestEnvironment
==================

Overview
--------
2DTestEnvironment is a lightweight test environment designed for a [Thesis](https://github.com/BenediktMehl/master-thesis/blob/main/thesis.pdf). It provides a quick overview of several layout algorithms and their performance. It is not a full-fledged simulation environment.

Quick start
------------
- Start the app with:
```bash
npm run algo-dev
```
- This runs the suite of layout algorithms and renders comparisons for quick evaluation.

Algorithms
----------
- CirclePacking: A simple circle packing algorithm that places circles without overlap. It uses the D3.js circle packing implementation—no special optimizations.
- codeCityAlgo: A straightforward implementation of the Code City layout approach from the original Code City papers. It is not optimized—built for testing and comparison.
- myAlgo: Essentially a normal CodeCharta treemap wrapped in a layoutNode conversion so it can be compared with the other algorithms and used for calculating metrics.
- nestedTreemapLayout: A simpler form of the D3 treemap (as used in CodeCharta treemaps) optimized for easier use in this thesis context.
- squarifyLayout: A direct copy of the D3 squarify layout algorithm.
- squarifyLayoutImproved: An improved version of squarify implemented for the thesis. It aims to optimize rectangle aspect ratios and minimize missing nodes. It includes configurable settings described in the thesis.
- sunburst: A simple sunburst layout that arranges nodes in a circular manner. It’s a straightforward implementation for comparison purposes.
- treeMapLayout: The CodeCharta treemap layout algorithm.

Notes
-----
- This environment is intended for quick iteration and comparison, not for production-grade simulations.
- For the improved squarify variant, refer to the thesis for details on the available settings and how they affect results.
