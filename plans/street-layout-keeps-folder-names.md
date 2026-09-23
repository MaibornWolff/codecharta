---
name: Street layouts leave folder names alone
issue: none
state: complete
version: 1
---

## Goal

Stop StreetMap and TreeMapStreet from renaming folders in the store's map tree when they merge a folder with its
single same-sized subfolder, which made the explorer show "root/src/root/src/app" after switching layouts.

## Tasks

### 1. Guard
- Deep-freeze helper for specs; the layout specs lay out a frozen map, so any write into it fails a test

### 2. Street keeps the merged name
- Merging returns the folder plus its combined "parent/child" label instead of renaming the folder
- The street puts the label on the node copy it already makes when laying itself out

## Steps

- [x] Complete Task 1: Guard (red for StreetMap and TreeMapStreet)
- [x] Complete Task 2: Street keeps the merged name (green)
- [x] All checks green (format, test, lint, tsc, e2e) and the explorer repro checked in the built app

## Notes

- Decisions (Q&A): street carries the label, no extra copies; fix lives on feature/metrics-bar-layout-tab as its own
  commit; add the freeze guard to the layout specs
- Cause: `mergeDirectories` in `streetViewHelper.ts` assigned `name` on the shared node since #1585 (2020)
- Verified: unit gate, tsc, depcruise, style lint, knip, Biome, 100/100 e2e on local Chromium; in the built app the
  explorer keeps "root/src › app" through repeated layout switches and explorer reopenings
- The frozen-map guard passes for Squarified TreeMap without changes, so only the street merge wrote into the tree
- Unrelated and older: a map that is one single-folder chain (root → src → app → files) draws nothing in StreetMap,
  with or without this fix
