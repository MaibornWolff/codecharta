package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPython

class PythonTypeAttributeQuery(val python: TreeSitterPython) {
    private val query = TSQuery(python, "(attribute) @attribute")

    fun execute(node: TSNode, bodyContainingNode: String) = node.execute(query).map { it.captures[0].node }.map {
        nodeAsString(it, bodyContainingNode)
    }
}
