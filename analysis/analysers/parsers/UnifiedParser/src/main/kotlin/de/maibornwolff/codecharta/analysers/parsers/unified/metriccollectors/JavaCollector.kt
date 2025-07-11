package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.JavaNodeTypes
import org.treesitter.TreeSitterJava

class JavaCollector : MetricCollector(
    treeSitterLanguage = TreeSitterJava(),
    queryProvider = JavaNodeTypes()
)
