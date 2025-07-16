package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.CSharpNodeTypes
import org.treesitter.TreeSitterCSharp

class CSharpCollector : MetricCollector(
    treeSitterLanguage = TreeSitterCSharp(),
    queryProvider = CSharpNodeTypes()
)
