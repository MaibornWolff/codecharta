---
name: Keep the dependency graph clear of the bar at its bottom
issue: -
state: complete
version: -
---

## Goal

Fitting the dependency graph and bringing a box into view leave the strip under the floating settings bar free, so no
box ends up hidden behind the bar.

## Tasks

### 1. A viewport that knows what covers its bottom
- Fitting, bringing into view and keeping a toggled box in place work on the part of the viewport above the bar

### 2. The bar tells the graph its height
- The dependency bar measures itself and reports the pixels it covers, gap included
- The graph is fitted anew once that is first measured

## Steps

- [x] Complete Task 1: A viewport that knows what covers its bottom
- [x] Complete Task 2: The bar tells the graph its height
- [x] Format check, tests, lint, type check
