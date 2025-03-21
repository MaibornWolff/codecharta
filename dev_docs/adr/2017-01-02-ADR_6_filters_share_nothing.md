---
categories:
  - ADR
tags:
  - analysis
title: "ADR 6: Filters share nothing"
---

In [ADR-1]({% post_url adr/2017-01-02-ADR_1_decide_tech_stack %}) we argued that:

> it would be rather embarrassing for a code quality tool to become tangled and then bug-ridden.

Tangles are created by dependencies between units of code.
To avoid this we decided to separate analysis and visualization into two tech stacks that share nothing.
But how do we keep the analysis from turning into a tangled mess?

# Status

accepted

# Decision

Except for one module called **model**, the filters are not allowed to share any code. No filter can depend on another filter.
The model contains only the code to generate a `.cc.json`, not metric parsing code.

# Consequences

- Most filters parse different metrics. Code replication can happen but should be negligible.
- The **shared** model means that code can be shared through it. By explicitly naming this module model instead of **shared** we hope to make it clear that it should only contain model contain and any other code needs to be replicated.
