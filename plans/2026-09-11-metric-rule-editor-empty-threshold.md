---
name: Metric rule editor keeps a cleared threshold empty
issue: -
state: complete
version: 2.3.2
---

## Goal

Clearing a threshold in the metric rule editor no longer writes "NaN" into the number input (Chrome
logs "The specified value "NaN" cannot be parsed"). An empty threshold still adds no rule.

## Tasks

### 1. Bind the inputs to text that is empty for a missing threshold
- Spec: a cleared threshold and a cleared upper threshold render as empty text
- Editor binds both inputs to that text instead of the raw number

## Steps

- [x] Complete Task 1: failing specs, fix, all checks green

## Notes

- Pre-existing since a5eb3816f; a console warning only, so no changelog entry
