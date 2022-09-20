---
categories:
    - How-to
tags:
    - sourcecodeparser
    - gitlogparser
    - merge
title: Analyzing a java project and its gitlog to generate a merged cc.json
---

# Prerequisites

-   CodeCharta-Visualization installed
-   CodeCharta-Analysis installed
-   git
-   Java installed and correctly configured
-   bash or similar

# Instructions

Navigate to the folder that contains the ccsh

```bash
# get project of your choice
git clone https://github.com/junit-team/junit4
cd junit4

# analyze junit4 with the sourcecodeparser and generate a cc.json
./ccsh sourcecodeparser . -o junit4.source.cc.json -nc

# generate cc.json from the gitlog automatically
./ccsh gitlogparser repo-scan -o junit4.git.cc.json -nc

# check structures of both cc.jsons to see if the folder structures are matching (src is on the same level)
./ccsh modify junit4.git.cc.json -p 1
./ccsh modify junit4.source.cc.json -p 1

# merge both cc.jsons into one if they matched before, otherwise use modify to adapt the folder structure
./ccsh merge junit4.source.cc.json junit4.git.cc.json -o junit4.cc.json
```

You can now open the merged cc.json in the visualization.
