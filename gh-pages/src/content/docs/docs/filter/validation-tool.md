---
title: "Validation Tool"
description: "Check with ccsh check that a cc.json file follows the 2.x schema and that every metric, edge and dependency entry points to a real node."
---

The Validation Tool (`ccsh check`) tells you whether a file is a valid cc.json file. Use it when you write or change
cc.json files by hand or with your own tooling, before you open them in the visualization or pass them to other
commands.

## Quick start

```bash
ccsh check project.cc.json.gz
```

If the file is valid, the command prints nothing. Otherwise it stops with an error that names what is wrong.

## Options

| Option       | Description            |
| ------------ | ---------------------- |
| `FILE`       | file to validate       |
| `-h, --help` | show the help and exit |

```text
Usage: ccsh check [-h] FILE
```

## What is checked

Plain and gzip-compressed files are both accepted.

**Schema.** The file must match the cc.json 2.x schema:

- `meta.apiVersion` has major version 2, such as `2.0` or `2.1`.
- `files` holds exactly one root node.
- Every node has an `id`, a `name` and a `type`, and a node of type `File` has no children.
- Properties the schema does not know are rejected on `meta`, on file nodes and on edges.

**References.** Every reference must point to something the file declares:

- every node id in the metrics lens points to a node,
- every edge starts and ends at a node,
- every node, leaf and leaf edge in the dependency lens points to a node or file,
- every leaf names a declared namespace and parent, and every namespace a declared parent,
- no leaf and no namespace is its own ancestor: a chain of parents that loops back is reported as cyclic.

A legacy 1.x file is not validated. The tool stops with the hint to upgrade it with
[`ccsh convert`](/docs/filter/convert) first.

## Related

- [Convert Tool](/docs/filter/convert): upgrade a legacy 1.x file
- [Inspection Tool](/docs/filter/inspection-tool): print the folder structure of a map
