package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPhp

class PhpInstantiationQueries {
    private val php = TreeSitterPhp()
    private val instantiations = TSQuery(php, "(object_creation_expression (name)@type)")

    fun getInstantiations(node: TSNode): List<TSNode> = execute(node, instantiations)

    private fun execute(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures[0].node } }
}
