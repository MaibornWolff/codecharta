---
categories:
    - How-to
tags:
    - sonarimport
    - scmlogparser
    - merge
title: Using Sonarqube and the Log from Git or Svn to visualize Codecharta's own Code
---

![flowchart]({{site.baseurl}}/assets/images/posts/how-to/analyze-codecharta/Sonar-Git-Merge.drawio.svg)

# Prerequisites

-   npm
-   git or svn
-   Java installed and correctly configured
-   bash or similiar

# Getting the Sonarqube data

-   Install the latest analysis tools globally `npm i -g codecharta-analysis`
-   Generate visualization data from our CodeCharta Sonarqube analysis `ccsh sonarimport -o sonar.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization`. A new file named _sonar.cc.json_ should appear in your working directory.

This file can already be opened in the [web visualization]({{site.web_visualization_link}}). If you want the information from the SCM log we need to continue a bit...

# Getting SCM Log Data

## Git

As the Codecharta project is managed using git, we want to analyze its git meta data:

-   Clone the repository `git clone https://github.com/MaibornWolff/codecharta.git` and navigate to it `cd codecharta`
-   Generate a git log file `git log --numstat --raw --topo-order > ../git.log` and navigate back `cd ..`. file and a _git.log_ file.
-   Ensure that the log file is encoded with UTF-8 if you get `java.lang.IllegalArgumentException`
-   Parse the log file `ccsh scmlogparser git.log --input-format GIT_LOG_NUMSTAT_RAW -o git.cc.json -p maibornwolff-gmbh_codecharta_visualization`. A new file named _git.cc.json_ should appear in your working directory.

## SVN

In case your project, which you want to analyse, is managed using SVN (Subversion) you can also get SVN-meta-data:

-   Navigate to your svn project `cd <my_svn_project>`
-   Create a svn log file using `svn log --verbose > ../svn.log` and navigate back `cd ..`
-   Ensure that the log file is encoded with UTF-8 if you get `java.lang.IllegalArgumentException`
-   Parse the log file `ccsh scmlogparser svn.log --input-format SVN_LOG -o svn.cc.json`

## Ensuring the encoding

There are several ways to do this

-   Open the log file with [Sublime](https://www.sublimetext.com/), `View -> Show Console`, then type `view.encoding()` and if necessary `File -> Save With Encoding`
-   In [Notepad++](https://notepad-plus-plus.org/) the same can be done via the `Encoding` menu.
-   On the command line we can check the encoding with `file -bi <log>` or `file -I <log>` and if necessary convert it to UTF-8 `iconv -f utf-16le -t utf-8 git_utf16.log > git_utf8.log`.

## Result

You should now see a codecharta folder, a _sonar.cc.json_ as well as the _git.cc.json_ or _svn.cc.json_. All three `cc.json`-files can be visualized separately with our [visualization]({{site.web_visualization_link}}) tool, but we can also merge those to one file...

# Merging sonar.cc.json and git.cc.json/svn.cc.json

Run the appropriate merge command, which should result in a _merge.cc.json_ file including data from both, Sonar and the appropriate SCM tool (Git or SVN):

-   For git: `ccsh merge --leaf sonar.cc.json git.cc.json > merge.cc.json`
-   For svn: `ccsh merge --leaf sonar.cc.json svn.cc.json > merge.cc.json`

You can use the [visualization]({{site.web_visualization_link}}) to open _merge.cc.json_ and see the combined result of the Sonarqube and SCM data.
