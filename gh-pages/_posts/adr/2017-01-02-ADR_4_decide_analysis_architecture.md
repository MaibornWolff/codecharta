---
categories:
  - ADR
tags:
  - analysis
title: "ADR 4: Decide Analysis Architecture"
---

The analysis needs to interact with many different metric tools and transform their metrics into the `.cc.json` format the visualization understands.
In this sense the analysis acts like a funnel for the visualization. It is probable that besides some basic parsing code, not many code parts can be reused.
The analysis needs an architecture that can handle these very different input parameters.

# Status

accepted

# Decision

The analysis will use a pipes and filters architecture.

- A filter is a small processing step, a mini-program if you so will.
- A pipe connects the output of one filter with the input of another.

This architecture can be seen in the Windows and Linux command-line.

F.ex. this bash script invokes two different programs and in combination tells me how often CodeCharta is mentioned in our project: `grep -ro 'CodeCharta' codecharta/ | wc -l`

# Consequences

This architecture is neither the most popular or most known one which makes the analysis learning curve steeper.
