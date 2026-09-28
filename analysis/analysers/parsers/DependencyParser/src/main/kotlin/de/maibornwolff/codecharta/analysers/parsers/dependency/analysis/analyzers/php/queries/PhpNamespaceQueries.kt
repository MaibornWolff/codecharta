package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPhp

class PhpNamespaceQueries {
    private val php = TreeSitterPhp()
    private val name = TSQuery(php, "(namespace_name) @name")
    private val declaration = TSQuery(php, "(namespace_definition) @declaration")
    private val importUsage = TSQuery(
        php,
        """
            [(require_once_expression (string) @require_once)
             (require_expression (string) @require)
             (include_once_expression (string) @include_once)
             (include_expression (string) @include)]
        """.trimIndent()
    )
    private val usage = TSQuery(php, "(namespace_use_declaration) @usage")
    private val singleUsage = TSQuery(php, "(namespace_use_clause (qualified_name))@usage")
    private val groupedUsage = TSQuery(php, "(namespace_use_declaration (namespace_name)@name (namespace_use_group)@group)")
    private val aliasNamespace = TSQuery(
        php,
        "(namespace_use_declaration(namespace_use_clause(qualified_name)@namespace alias: (name)@alias))"
    )

    fun getImportUsages(node: TSNode): List<TSNode> = execute(node, importUsage)

    fun getName(node: TSNode): TSNode? {
        val declaration = getDeclarations(node)
        return declaration?.let {
            return execute(node, name).firstOrNull()
        }
    }

    private fun getDeclarations(node: TSNode): TSNode? = execute(node, declaration).firstOrNull()

    fun getUsages(node: TSNode): List<TSNode> = execute(node, usage)

    fun getSingleUsages(node: TSNode): List<TSNode> = execute(node, singleUsage)

    fun getGroupedUsages(node: TSNode): List<TSNode> = executeForManyCaptures(node, groupedUsage)

    fun getAliasUsages(node: TSNode): List<TSNode> = executeForManyCaptures(node, aliasNamespace)

    fun getAliasUsage(node: TSNode): List<TSNode> = execute(node, aliasNamespace)

    private fun execute(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures[0].node } }

    private fun executeForManyCaptures(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures } }
        .flatMap { captures -> captures.map { capture -> capture.node } }
}
