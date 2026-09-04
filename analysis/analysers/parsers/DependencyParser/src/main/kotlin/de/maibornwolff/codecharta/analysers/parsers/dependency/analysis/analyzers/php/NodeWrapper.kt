package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import org.treesitter.TSNode

data class NodeWrapper(val treesitterNode: TSNode, val nodeType: NodeType, val getName: () -> String)
