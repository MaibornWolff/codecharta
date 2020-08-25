---
permalink: /docs/metrics/
title: "Metrics"
---

> When a metric becomes a target, it ceases to be a good metric.  
> -- Free interpretation of [Goodhearts Law](https://en.wikipedia.org/wiki/Goodhart%27s_law)

Goodhearts paraphrased adage sums up our feelings about metrics quite well. We think metrics are a good place to **start** a conversation:

> Question: "Why does this really complex class have so little line coverage? Do we need to do something about that? Does that low coverage create problems for future feature X?"

Metrics are really bad as targets however.

> Order: "Increase the line coverage of these 100 classes to 100% within 4 weeks."

It is really easy to increase the line coverage by writing tests **without** asserts for all class methods. If we are evaluated or paid based on the amount of coverage we generate, we'll do that and the metric will cease to be a good metric. Job accomplished, the patient is dead.

However, as long as we have a shared understanding and don't abuse metrics we can gain a lot of valuable insight from them. An excerpt of the metrics we find quite valuable are listed below. If you want to add your own metrics you should take a look at adding [custom metrics]({{site.baseurl}}{% link _docs/05-04-custom-metrics.md %}).

-   rloc (Real lines of code): All lines that aren't comments or whitespace. Helpful because it tells us how much actual code exists and excludes commented code as well as other heavy comments like copyright notices. Can be extracted from source code.
-   mcc (McCabe [cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)): the number of times the control flow branches. An `if` is a branch, so is a `switch` case or a `while` loop. Each of these branches means a decision was made. Code were many decisions are made is complex to understand. Can be extracted from source code.
-   line_coverage: how many code lines are covered by tests. Depending on your point of view between 80 and 100% is desirable. Can be extracted from a coverage report.
-   sonar_code_smells: the number of smells Sonar has identified. A smell is an indication that something might be wrong and the developer should check. Extracted from [Sonar](https://www.sonarqube.org/).
-   avg_code_churn: the average number of lines added or removed from this file. A file that is heavily edited is worth another look, because it might mean this file is an coordination problem. Can be extracted from [SCM (Source Control Management)](https://en.wikipedia.org/wiki/Version_control) like Git or SVN.
-   number_of_authors: the number of authors that have edited this file. A file that is heavily edited by many different people is worth another look, because it might mean this file is an coordination problem. Can be extracted from [SCM (Source Control Management)](https://en.wikipedia.org/wiki/Version_control) like Git or SVN.
