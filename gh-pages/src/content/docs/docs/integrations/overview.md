---
title: "Integrations"
description: "Bring results from your own tools into CodeCharta using the cc.json file format or existing importers."
---

Use CodeCharta to visualize results from your own analysis tools. Exchange files through the cc.json format or use
an existing importer, without uploading your code to a service.

## Generate CodeCharta files

The [cc.json file format](/docs/integrations/file-format) is CodeCharta's data interchange API. Write analysis results
as `.cc.json` files to open them in the visualization or combine them with results from CodeCharta's parsers and
importers. The format guide links to the JSON Schema, detailed specification and validation tools.

If your tool already exports tabular metrics, the [CSV importer](/docs/importer/csv) can be a simpler starting point
than generating cc.json directly. See the [available importers](/docs/analysis/codecharta-shell) for other supported inputs.
