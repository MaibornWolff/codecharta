package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.TypescriptQueries
import org.treesitter.TreeSitterTypescript

class TypescriptCollector : MetricCollector(
    queryProvider = TypescriptQueries(),
    treeSitterLanguage = TreeSitterTypescript()
)
