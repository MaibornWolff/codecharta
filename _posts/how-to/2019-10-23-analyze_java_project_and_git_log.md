---
categories:
    - How-to
tags:
    - sourcecodeparser
    - scmlogparser
    - merge
title: Analyzing a java project and it's gitlog to generate a merged cc.json
---

# Prerequisites

-   CodeCharta-Visualization installed
-   CodeCharta-Analysis installed
-   git or svn
-   Java installed and correctly configured
-   bash or similiar

# Instructions

Navigate to the folder that contains the ccsh

```bash
# get project of your choice
git clone https://github.com/junit-team/junit4

# analyze junit4 with the sourcecodeparser and generate a cc.json
./ccsh sourcecodeparser junit4 -p junit4 -o junit4.source.cc.json

# generate git.log
cd junit4
git log --numstat --raw --topo-order > ../junit4.git.log

# generate a cc.json from that git.log
./ccsh scmlogparser junit4.git.log -p junit4 -o junit4.git.cc.json --input-format GIT_LOG_NUMSTAT_RAW

# check structures of both cc.jsons to see if the folder structures are matching (src is on the same level)
./ccsh modify junit4.git.cc.json -p 1
./ccsh modify junit4.source.cc.json -p 1

# merge both cc.jsons into one if they matched before, otherwise use modify to adapt the folder structure
./ccsh merge junit4.source.cc.json junit4.git.cc.json -o junit4.cc.json
```

You can now open the merged cc.json in the visualization.
