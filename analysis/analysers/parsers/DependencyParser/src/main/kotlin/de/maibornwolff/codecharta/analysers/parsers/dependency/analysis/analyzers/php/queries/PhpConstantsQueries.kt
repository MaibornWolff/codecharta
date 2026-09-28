package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPhp

class PhpConstantsQueries {
    private val php = TreeSitterPhp()
    private val declarations = TSQuery(php, "(program (const_declaration (const_element (name)@const)))")
    private val classAccessDeclaration = TSQuery(php, "(class_constant_access_expression (name)@type (name)@name)")
    private val defineDeclaration =
        TSQuery(
            php,
            """(function_call_expression
  function: (name) @func_name
  arguments: (arguments) @define_args)
            """.trimIndent()
        )

    fun getDeclarations(node: TSNode): List<TSNode> = execute(node, declarations)

    fun getClassAccessDeclaration(node: TSNode): List<TSNode> = execute(node, classAccessDeclaration)

    fun getDefineDeclaration(node: TSNode): List<TSNode> = executeForManyCaptures(node, defineDeclaration)

    private fun execute(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures[0].node } }

    private fun executeForManyCaptures(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures } }
        .flatMap { captures -> captures.map { capture -> capture.node } }
}
