---
name: Run the DependencyParser in simplecc-local
issue: <#issueid>
state: complete
version: 1
---

## Goal

Let `simplecc-local.sh` add the experimental dependency lens to its cc.json so the dependency view can be
tried on real projects, while `simplecc.sh` stays without it until the parser leaves experimental.

## Tasks

### 1. Add a dependency step to the local wrapper
- Run `simplecc.sh` unchanged, then `ccsh dependencyparser` on the same folder
- Merge its output into the generated `<Folder>.cc.json.gz`, honouring `--leaf-merge`

## Steps

- [x] Complete Task 1: Add a dependency step to the local wrapper

## Notes

- Verified on `sample-projects/java`: output holds the metrics, dependency and domain lenses; all dependency nodes merged onto existing ones
