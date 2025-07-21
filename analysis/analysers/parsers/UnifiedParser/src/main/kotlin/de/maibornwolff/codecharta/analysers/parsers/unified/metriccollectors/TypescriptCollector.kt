package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.TypescriptNodeTypes
import org.treesitter.TreeSitterTypescript

class TypescriptCollector : MetricCollector(
    treeSitterLanguage = TreeSitterTypescript(),
    nodeTypeProvider = TypescriptNodeTypes()
)
