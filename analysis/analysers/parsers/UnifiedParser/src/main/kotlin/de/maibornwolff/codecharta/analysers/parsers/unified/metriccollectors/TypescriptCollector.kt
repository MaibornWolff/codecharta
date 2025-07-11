package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.TypescriptNodeTypes
import org.treesitter.TreeSitterTypescript

class TypescriptCollector : MetricCollector(
    treeSitterLanguage = TreeSitterTypescript(),
    queryProvider = TypescriptNodeTypes()
)
