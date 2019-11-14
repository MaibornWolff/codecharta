---
permalink: /docs/analysis/
title: "Analysis"
---

The goal of the CodeCharta analysis is to be as **flexible** as possible when **combining** metrics.

There are many tools already available that generate metrics and we wanted to incorporate them as much as possible because we are standing on the shoulder of giants. Since most of them provide some kind of metrics export in a common format (csv, json, ...) we naturally started out writing many small importers per source. For example we wrote a Sonarimporter, then a Csvimporter and later a Mergefilter to combine these sources. After a while this became a bit unwieldy and we bundled all these small tools under the banner of the CodeCharta Shell (ccsh).

All of these tools have in common that their input and/or output is a `.cc.json` which they usually enrich with quantitative measurements called metrics. We think these metrics are i some ways flawed but still very useful as a conversation starter. They should never finish a conversation ("You have to increase line_coverage!").

If you want to learn more, you can read about good and bad [metrics]({{site.baseurl}}{% link _docs/05-02-metrics.md %}), how the [importers]({{site.baseurl}}{% link _docs/05-03-importers.md %}) plus the `.cc.json` work or how to create [custom metrics or importers]({{site.baseurl}}{% link _docs/05-04-custom-metrics.md %}).
