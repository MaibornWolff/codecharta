package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.GoNodeTypes
import org.treesitter.TreeSitterGo

class GoCollector : MetricCollector(
    treeSitterLanguage = TreeSitterGo(),
    nodeTypeProvider = GoNodeTypes()
)
