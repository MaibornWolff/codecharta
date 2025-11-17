package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.ObjectiveCNodeTypes
import org.treesitter.TreeSitterObjc

class ObjectiveCCollector : MetricCollector(
    treeSitterLanguage = TreeSitterObjc(),
    nodeTypeProvider = ObjectiveCNodeTypes()
)
