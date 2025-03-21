---
categories:
  - ADR
tags:
  - analysis
title: "ADR 5: Pick Analysis Cli Library"
---

# Context

As noted in [ADR-4]({% post_url adr/2017-01-02-ADR_4_decide_analysis_architecture %}) CodeCharta will use a pipes and filters architecture.
But it has not been defined how the user will interact with the analysis.

# Status

accepted

# Decision

CodeCharta Analysis will be a set of command-line tools that use [PicoCli](https://picocli.info/). PicoCli is small, powerful, regularly updated and works great in combination with Kotlin.

# Consequences

- A cli is not as intuitive as a well-structured graphical user interface would have been.
