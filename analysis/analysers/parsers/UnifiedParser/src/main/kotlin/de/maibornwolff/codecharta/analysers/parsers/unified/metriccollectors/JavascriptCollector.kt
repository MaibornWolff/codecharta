package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.JavascriptNodeTypes
import org.treesitter.TreeSitterJavascript

class JavascriptCollector : MetricCollector(
    treeSitterLanguage = TreeSitterJavascript(),
    queryProvider = JavascriptNodeTypes()
)
