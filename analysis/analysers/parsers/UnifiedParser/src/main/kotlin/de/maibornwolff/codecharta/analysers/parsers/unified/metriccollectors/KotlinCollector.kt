package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.KotlinQueries
import org.treesitter.TreeSitterKotlin

class KotlinCollector : MetricCollector(
    treeSitterLanguage = TreeSitterKotlin(),
    queryProvider = KotlinQueries()
)
