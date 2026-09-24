---
name: Explorer — keep the open folders when the Files tree is rebuilt
issue: -
state: complete
version: vis 2.6.0
---

## Goal

Switching the explorer to another mode (Words) or collapsing the sidebar and coming back shows the
Files tree with the same folders open as before, instead of only the root.

## Tasks

### 1. Remember open folders per view

- A view-scoped service holds which folders are open, provided with the other explorer state.
- Tree levels read and write it instead of a local flag; the root stays open by default.
- A reveal opens the ancestors through the same service.

## Steps

- [x] Complete Task 1: remember open folders per view
