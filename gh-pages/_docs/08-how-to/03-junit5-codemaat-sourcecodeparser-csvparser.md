---
permalink: /docs/how-to/visualize-junit5
tags:
  - unifiedparser
  - codemaatimport

title: Visualizing JUnit5 with CodeMaat and UnifiedParser

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

{: .notice--warning}
**Note:** This guide has been updated to use UnifiedParser instead of the deprecated SourceCodeParser.

## Prerequisites

- bash or similar
- leiningen
- Java 64bit
- npm

## Steps

- Install the latest CodeCharta analysis tools `npm i -g codecharta-analysis`
- Clone the code-maat repository `git clone https://github.com/adamtornhill/code-maat.git`
- Clone the JUnit5 repository `git clone https://github.com/junit-team/junit5.git`
- Build code-maat:
  - cd code-maat
  - lein uberjar
  - cd ..
- cd junit5
- git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' --no-renames > log.txt
- cd ..
- cd code-maat
- lein.bat run -l ../junit5/log.txt -c git2 -a revisions > revisions.csv
- lein.bat run -l ../junit5/log.txt -c git2 -a entity-churn > entity-churn.csv
- cd ../junit5
- **Updated:** `ccsh unifiedparser . -o unified.json`

## Alternative: Use the Complete Analysis Script

For a more comprehensive analysis, you can use the simplecc.sh script instead:

```bash
cd junit5
../codecharta/analysis/script/simplecc.sh create junit5-analysis
```

This will combine multiple analyzers including UnifiedParser, git history, and other metrics.
