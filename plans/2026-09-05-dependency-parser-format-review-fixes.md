---
name: Fix the findings of the dependency parser format review
issue: <#issueid>
state: complete
version: 1
---

## Goal

Close the findings of the 2026-09-05 review of what `ccsh dependencyparser` writes into the cc.json 2.0
`dependency` lens: a filter can leave level entries pointing at pruned folders, the edge weight is
documented as something it is not, and PHP weights deviate from DependaCharta. No visualization work.

## Tasks

### 1. Drop lens entries for nodes the restructuring pruned
- `modify --move` empties the source folders and prunes them, but `nodeIdRemapping` keeps an entry for
  every node whose path did not change, so `nodes` still carries their levels
- Give the remapping the restructured tree as well and keep only ids that exist in it; both node-keyed
  lenses go through the same helper, so both are fixed at once

### 2. Describe the weight as DependaCharta does
- `dependencies` counts declaration-level dependencies, not source references: DependaCharta hardcodes
  a leaf-to-leaf weight of 1 and only sums when edges collapse onto a namespace or file
- Reword the README, the gh-pages page and the three attribute descriptors

### 3. Guard the PHP weight against DependaCharta
- Suspected deviation: PHP records one `Dependency` per usage kind, so a pair with two kinds would
  weigh 2. It does not happen: a used type is identified by name alone, in both tools, so a pair keeps
  the first kind found and weighs 1. A pipeline test over a PHP sample pins that, and the docs say it

### 4. Mention the logical layer in the command summary

## Steps

- [x] Complete Task 1: prune-aware rekeying
- [x] Complete Task 2: weight wording
- [x] Complete Task 3: PHP weight parity
- [x] Complete Task 4: command summary

## Notes

- Rendering the flags, levels and the logical layer in the visualization is out of scope; the data is
  write-only until a follow-up picks it up.
