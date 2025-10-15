---
permalink: /docs/parser/source-code
title: "Source Code Parser"
redirect_from:
  - /parser/

toc: false
---

# DEPRECATED AND REMOVED

{: .notice--danger}

The SourceCodeParser has been **deprecated and removed** from CodeCharta.

Running `ccsh sourcecodeparser` will exit with an error message.

## Use These Alternatives Instead

- [Unified Parser](/docs/parser/unified) - Modern multi-language parser
- [Sonar Importer](/docs/importer/sonar) - Import from SonarQube
- [Coverage Importer](/docs/importer/coverage) - Import coverage data
- [Raw Text Parser](/docs/parser/raw-text) - Basic text metrics
- [Tokei Importer](/docs/importer/tokei) - Line count statistics

## Complete Analysis Script

For comprehensive analysis, use:

```bash
analysis/script/simplecc.sh create <output-file>
```

This combines multiple analyzers (tokei, complexity, git, rawtextparser, unifiedparser).
