package de.maibornwolff.treesitter.excavationsite.integration.metrics.ports

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeNodeTypes

/** The node types one count counts, with the key per node type that tells the objects they define apart. */
class CountedNodeTypes(val nodeTypes: TreeNodeTypes, val objectKeyByNodeType: Map<String, (SyntaxNode) -> String?>)
