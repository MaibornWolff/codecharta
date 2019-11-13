---
categories:
  - ADR
tags:
  - analysis
  - kotlin
title: "ADR 2: Pick Analysis Stack Language"
---

As noted in [ADR-1]({% post_url adr/2017-01-02-ADR_1_decide_tech_stack %}) CodeCharta will use the jvm for the analysis stack.
We haven't decided which language to program in though. The language should be familiar to developers used to OO languages
and allow them to quickly start developing. This is especially relevant if team members change frequently.

# Status

accepted

# Decision

We will use [Kotlin](https://kotlinlang.org/). It is more expressive than our other choice, Java, and the syntax feels familiar to developers familiar with the latter.
Also it has great interop support with java, which is of great benefit since many metric parsing tools are also based on java.

# Consequences

- While similar to Java, Kotlin is different enough to require some getting used to. The transition shouldn't take longer than a couple of weeks though.
- Not every tool that is available for Java development, is also available in a Kotlin edition.
- Parts of it might not be production ready and break at unexpected moment. This is ok for our case, because the analysis does not have to be real time and can be restarted.
  - On May 17, 2017 [Google announced](https://blog.jetbrains.com/kotlin/2017/05/kotlin-on-android-now-official/) first-class support for Kotlin on Android. This makes the previous point a bit less likely to be true.
