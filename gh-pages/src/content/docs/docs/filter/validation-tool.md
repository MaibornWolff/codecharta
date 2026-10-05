---
title: "Validation Tool"
---

## Validation

The Validation Tool checks whether a file is a valid `cc.json` file. This is useful if you created or changed a `cc.json` file by hand or with your own tooling. It checks that:

- the file matches the `cc.json` schema (plain and gzip-compressed files are both accepted),
- every reference resolves: the node ids used by the metrics lens, the edge endpoints and the entries of the dependency lens all have to point to a node, leaf or namespace the file declares.

If the file is valid, the command prints nothing. Otherwise it stops with an error that names what is wrong.

A legacy 1.x file is not validated. The tool stops with the hint to upgrade the file with [`ccsh convert`](/docs/filter/convert) first.

#### Usage and Parameters

| Parameters   | Description             |
|--------------|-------------------------|
| `FILE`       | file to validate        |
| `-h, --help` | displays help and exits |

```
Usage: ccsh check [-h] FILE
```

### Examples

```
ccsh check foo.cc.json
```
