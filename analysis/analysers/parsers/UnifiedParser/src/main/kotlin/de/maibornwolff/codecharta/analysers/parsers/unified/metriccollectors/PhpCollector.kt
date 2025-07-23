package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.PhpNodeTypes
import org.treesitter.TreeSitterPhp

class PhpCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPhp(),
    nodeTypeProvider = PhpNodeTypes()
)
