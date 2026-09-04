package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPython

class PythonDefinitionsQuery(val python: TreeSitterPython) {
    private val query = TSQuery(
        python,
        """
        (module [
         (class_definition)
         (function_definition)
        ] @definition)
        """.trimIndent()
    )
    private val decoratedQuery = TSQuery(python, "(module (decorated_definition) @definition)")

    private val assignmentQuery =
        TSQuery(python, "(module (expression_statement (assignment left: (identifier)  @identifier)))")

    fun execute(node: TSNode): List<TSNode> {
        val definitions = node.execute(query).map { it.captures[0].node }
        val decoratedDefinitions = node.execute(decoratedQuery).map { it.captures[0].node }
        val assignmentDefinitions = node.execute(assignmentQuery).map { it.captures[0].node }

        return definitions + decoratedDefinitions + assignmentDefinitions
    }
}
