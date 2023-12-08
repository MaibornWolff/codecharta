---
categories:
    - How-to
tags:
    - sourcecodeparser
    - codemaatimport
title: Visualizing JUnit5 with CodeMaat, SourceCodeParser and CSVParser
---

Work in progress

## Prerequisites

-   bash or similiar
-   leiningen
-   Java 64bit
-   npm

## Steps

-   Install the latest CodeCharta analysis tools `npm i -g codecharta-analysis`
-   Clone the code-maat repository `git clone https://github.com/adamtornhill/code-maat.git`
-   Clone the JUnit5 repository `git clone https://github.com/junit-team/junit5.git`
-   Build code-maat:
-   cd code-maat
-   lein uberjar
-   cd ..
-   cd junit5
-   git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' --no-renames > log.txt
-   cd ..
-   cd code-maat
-   lein.bat run -l ../junit5/log.txt -c git2 -a revisions > revisions.csv
-   lein.bat run -l ../junit5/log.txt -c git2 -a entity-churn > entity-churn.csv
-   cd ../junit5
-   ccsh sourcecodeparser . -p junit5 -o scp.json
