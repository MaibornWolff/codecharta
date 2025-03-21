---
categories:
  - ADR
tags:
  - visualization
  - javascript
title: "ADR 3: Pick Visualization Language"
---

As noted in [ADR-1]({% post_url adr/2017-01-02-ADR_1_decide_tech_stack %}) CodeCharta will use the web browser for the visualization stack.
We haven't decided which language to program in though. The language should be familiar to developers used to OO languages
and allow them to quickly start developing. This is especially relevant if team members change frequently.

# Status

superseded by [ADR-7]({% post_url adr/2017-09-03-ADR_7_pick_visualization_language %})

# Decision

We will use [JavaScript](https://developer.mozilla.org/de/docs/Web/JavaScript). It is the default choice in the web browser and it is familiar to most of our developers.

# Consequences

- JavaScript does not look like our analysis language and knowledge is not easily transferred.
- Unlike our analysis language JavaScript does not have static typing, which again makes knowledge transfer harder.
  - Also static types have been a good choice for larger programs, which the visualization could eventually become.
