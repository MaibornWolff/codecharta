package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.KotlinNodeTypes
import org.treesitter.TreeSitterKotlin

class KotlinCollector : MetricCollector(
    treeSitterLanguage = TreeSitterKotlin(),
    queryProvider = KotlinNodeTypes()
)
