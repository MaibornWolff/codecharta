package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPhp

class PhpFunctionQueries {
    private val php = TreeSitterPhp()
    private val declarationOutSideClass = TSQuery(php, "[(program) (namespace_definition)] (function_definition) @func")
    private val name = TSQuery(php, "(function_definition (name) @name )")
    private val argumentTypes = TSQuery(php, "(formal_parameters(simple_parameter(named_type)@argumentType))")
    private val returnTypes =
        TSQuery(
            php,
            "[(function_definition return_type: (named_type)@type) (method_declaration return_type: (named_type)@type) (method_declaration return_type: (optional_type (named_type)@type))]"
        )
    private val staticFunctionAccess = TSQuery(php, "(scoped_call_expression scope: (name)@name)")

    fun getDeclarations(node: TSNode): List<TSNode> = execute(node, declarationOutSideClass)

    fun getName(node: TSNode): List<TSNode> = execute(node, name)

    fun getArgumentTypes(node: TSNode): List<TSNode> = execute(node, argumentTypes)

    fun getReturnTypes(node: TSNode): List<TSNode> = execute(node, returnTypes)

    fun getStaticFunctionAccess(node: TSNode): List<TSNode> = execute(node, staticFunctionAccess)

    private fun execute(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures[0].node } }
}
