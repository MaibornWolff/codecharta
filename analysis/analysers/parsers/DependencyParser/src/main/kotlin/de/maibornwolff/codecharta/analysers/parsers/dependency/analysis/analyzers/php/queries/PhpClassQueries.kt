package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPhp

/**
 *  [execute]
 */
class PhpClassQueries {
    private val php = TreeSitterPhp()
    private val declarations = TSQuery(php, "(class_declaration) @declaration")
    private val name = TSQuery(php, "(class_declaration name: (name) @name)")
    private val usedPropertyTypes =
        TSQuery(
            php,
            "(class_declaration body: (declaration_list (property_declaration [type: (named_type)@usedType type: (optional_type (named_type)@usedType)])))"
        )
    private val inheritedTypes = TSQuery(php, "(class_declaration(base_clause(name)@inherited))")
    private val implementedTypes = TSQuery(php, "(class_declaration(class_interface_clause(name)@implemented))")
    private val traitTypes = TSQuery(php, "(trait_declaration name: (name)@traitClassName)")
    private val usedTraitTypes = TSQuery(php, "(class_declaration body: (declaration_list(use_declaration (name)@trait)))")

    fun getDeclarations(node: TSNode): List<TSNode> = execute(node, declarations)

    fun getName(node: TSNode): List<TSNode> = execute(node, name)

    fun getUsedPropertyTypes(node: TSNode): List<TSNode> = execute(node, usedPropertyTypes)

    fun getInheritedTypes(node: TSNode): List<TSNode> = execute(node, inheritedTypes)

    fun getImplementedTypes(node: TSNode): List<TSNode> = execute(node, implementedTypes)

    fun getTraitTypes(node: TSNode): List<TSNode> = execute(node, traitTypes)

    fun getUsedTraitTypes(node: TSNode): List<TSNode> = execute(node, usedTraitTypes)

    private fun execute(node: TSNode, query: TSQuery): List<TSNode> = node
        .execute(query)
        .mapNotNull { it.let { if (it.captures.isEmpty()) return@let null else it.captures[0].node } }
}
