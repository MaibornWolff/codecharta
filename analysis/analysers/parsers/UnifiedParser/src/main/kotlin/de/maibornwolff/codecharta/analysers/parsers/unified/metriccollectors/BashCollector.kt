package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.BashNodeTypes
import org.treesitter.TreeSitterBash

class BashCollector : MetricCollector(
    treeSitterLanguage = TreeSitterBash(),
    nodeTypeProvider = BashNodeTypes()
)
