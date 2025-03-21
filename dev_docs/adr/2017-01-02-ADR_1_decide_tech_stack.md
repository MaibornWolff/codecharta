---
categories:
  - ADR
tags:
  - analysis
  - visualization
  - cc.json
title: "ADR 1: Decide Tech Stack"
---

CodeCharta needs to analyze and visualize code to facilitate code audits. Many great tools exist that do one of these or both.
If we can, we want to incorporate the analysis tools, because finding new quality code metrics is not something we want to do in the beginning.
On the other hand visualizing code is something we feel very confident about and want to tackle ourselves.
To keep CodeCharta from becoming tangled these two concerns, analysis and visualization, should be separated.
After all, it would be rather embarrassing for a code quality tool to become tangled and then bug-ridden.

# Status

accepted

# Decision

CodeCharta will be divided into two tech stacks and also folders for `analysis/` and `visualization/` that only communicate via .json files.

- The runtime for the analysis is the jvm. We picked this because java is the main programming language we need to audit and most java metric tools are also written in java.
- The runtime for the visualization is the web browser. This provides the most flexibility.
- Many users can try out CodeCharta without having to install anything.
- It can be incorporated into the web frontends of other code quality tools like Sonar.
- If we ship a desktop version we can do that as well.
- The interchange file format is `json`, the file extension `.cc.json`. The browser supports it directly and many libraries exist for the jvm.

# Consequences

Many benefits have already been listed. There are a couple of trade-offs though.

- We probably have to write and maintain code in two different programming languages
- The jvm does not have metric tools for all programming languages
- The web might not be able to provide the performance we need for the visualization.
- Providing two different stacks for analyzation and visualization is not as user-friendly as providing a single program.
