package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.ScalaNodeTypes
import org.treesitter.TreeSitterScala

class ScalaCollector : MetricCollector(
    treeSitterLanguage = TreeSitterScala(),
    nodeTypeProvider = ScalaNodeTypes()
)
