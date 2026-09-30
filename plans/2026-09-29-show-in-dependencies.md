---
name: Show in Dependencies from the node context menu
issue: -
state: complete
version: -
---

## Goal

Right-clicking a building in the Metric view offers "Show in Dependencies" next to "Show in Domain" whenever the node
has a place in the dependency graph, and the dependency view selects and reveals it on arrival.

## Tasks

### 1. Several jump targets per menu
- `jumpTargetView` becomes a list; the Metric view offers Domain and Dependencies, the other views Metrics
- Domain only with domain data, Dependencies only for a node the graph can show (`pathsWithDependencyLevels`)

### 2. The dependency view receives the handed-over node
- On arrival select the node, open the folders around it in the graph and reveal it in the explorer, like the
  Metric view's `ShowsHandedOverNodeDirective`

## Steps

- [x] Complete Task 1: Several jump targets per menu
- [x] Complete Task 2: The dependency view receives the handed-over node

## Notes

- Domain and dependency views keep jumping to Metrics only; offering every other view there is a later decision
