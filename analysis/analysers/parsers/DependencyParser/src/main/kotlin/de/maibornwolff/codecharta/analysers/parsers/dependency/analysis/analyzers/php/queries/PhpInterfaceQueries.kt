package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPhp

class PhpInterfaceQueries {
    private val php = TreeSitterPhp()
    private val declarations = TSQuery(php, "(interface_declaration) @declaration")
    private val name = TSQuery(php, "(interface_declaration name: (name) @name)")

    fun getDeclarations(node: TSNode): List<TSNode> = execute(node, declarations)

    fun getName(node: TSNode): List<TSNode> = execute(node, name)

    private fun execute(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures[0].node } }
}
