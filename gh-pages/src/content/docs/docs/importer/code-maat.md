---
title: "Code Maat Importer"
description: "Import Code Maat's temporal coupling CSV to see which files are committed together, as edges and as coupling metrics on every file."
---

The Code Maat importer turns the coupling analysis of [Code Maat](https://github.com/adamtornhill/code-maat) into a
cc.json file. You see which files change together: every coupled pair becomes an edge carrying `pairingRate` and
`avgCommits`. Code Maat reads version control history, so this works for code in any language.

Use it when you want to find hidden dependencies, such as two files in different folders that always change in the
same commit.

## Quick start

```bash
# 1. Write the git history in the format Code Maat's "git" parser reads
git log --pretty=format:'[%h] %an %ad %s' --date=short --numstat > project.log

# 2. Let Code Maat compute the coupling (or run it with java -jar code-maat-<version>-standalone.jar)
maat -c git -l project.log -a coupling > edges.csv

# 3. Import the coupling and turn the edge attributes into metrics on every file
ccsh codemaatimport edges.csv -o edges.cc.json
ccsh edgefilter edges.cc.json.gz -o visual_edges.cc.json

# 4. Merge the result with a map of the code itself
ccsh unifiedparser . -o metrics.cc.json
ccsh merge visual_edges.cc.json metrics.cc.json.gz -o merged.cc.json
```

Open `merged.cc.json.gz` in the [Web Studio](/docs/visualization/web-studio).

![Flow from a cloned project through git log, Code Maat, codemaatimport and edgefilter into merge with a metrics file, ending in one cc.json file](/assets/images/docs/codemaat/codemaatimport-modell.png)

## Options

| Option                           | Description                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| `FILE...`                        | one or more Code Maat coupling CSV files, each with its header |
| `-o, --output-file=<outputFile>` | output file; prints to stdout when omitted                     |
| `-nc, --not-compressed`          | write plain JSON instead of a gzip file                        |
| `-h, --help`                     | show the help and exit                                         |

```text
Usage: ccsh codemaatimport [-h] [-nc] [-o=<outputFile>] FILE...
```

## Metrics

Both metrics are edge metrics. They sit on the edge between two files.

| Metric        | Code Maat column | Type     | Description                                                |
| ------------- | ---------------- | -------- | ---------------------------------------------------------- |
| `pairingRate` | `degree`         | relative | how often, in percent, the two files are committed together |
| `avgCommits`  | `average-revs`   | absolute | average number of commits the two files appear in          |

The `entity` and `coupled` columns name the two files. Every file named there becomes a node of the map, even when it
carries no metric yet.

## Example

A coupling CSV from Code Maat looks like this:

```text
entity,coupled,degree,average-revs
app/codeCharta.html,app/codeCharta.scss,56,10
app/testVille.html,app/codeCharta.html,42,8
```

`ccsh codemaatimport` writes each row as an edge in the dependency lens (excerpt):

```json
"dependency": {
  "edges": [
    { "fromId": "6b185a8cc9433de8", "toId": "d515f754245533a8", "attributes": { "pairingRate": 56, "avgCommits": 10 } },
    { "fromId": "4c6b71df479538b7", "toId": "6b185a8cc9433de8", "attributes": { "pairingRate": 42, "avgCommits": 8 } }
  ],
  "attributeTypes": { "pairingRate": "relative", "avgCommits": "absolute" }
}
```

After `ccsh edgefilter`, `app/codeCharta.html`, which takes part in both pairs, carries `pairingRate` 49 (the average)
and `avgCommits` 18 (the sum). See the [Edge Filter](/docs/filter/edge-filter) for how it aggregates.

## Related

- [Edge Filter](/docs/filter/edge-filter): turn edge attributes into metrics on every file
- [Merge Filter](/docs/filter/merge-filter): combine the coupling with other maps
- [Git Log Parser](/docs/parser/git-log): coupling and churn metrics straight from git, without Code Maat
