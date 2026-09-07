package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterGo

class GoDeclarationsQuery(val go: TreeSitterGo) {
    private val declarationsQuery = TSQuery(
        go,
        """
        [
            (type_declaration)
            (function_declaration)
            (method_declaration)
        ] @declaration
        """.trimIndent()
    )

    fun execute(node: TSNode): List<TSNode> = node.execute(declarationsQuery).map { match ->
        match.captures[0].node
    }
}
