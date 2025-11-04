package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.SwiftNodeTypes
import org.treesitter.TreeSitterSwift

class SwiftCollector : MetricCollector(
    treeSitterLanguage = TreeSitterSwift(),
    nodeTypeProvider = SwiftNodeTypes()
)
