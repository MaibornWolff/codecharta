package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/** Functions, properties and typealiases declared at the top of a file; overloads of one name are one declaration. */
internal object TopLevelDeclarationExtractor {
    private const val FUNCTION_DECLARATION = "function_declaration"
    private const val PROPERTY_DECLARATION = "property_declaration"
    private const val TYPE_ALIAS = "type_alias"
    private const val VARIABLE_DECLARATION = "variable_declaration"
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"

    private val NODES_WITHOUT_CODE = setOf(
        "package_header",
        "import_list",
        "line_comment",
        "multiline_comment",
        "shebang_line",
        "file_annotation"
    )

    fun extract(rootNode: SyntaxNode, importedNames: Set<String>): List<Declaration> = rootNode
        .namedChildren()
        .filterNot { FunInterfaceExtractor.isFunInterface(it) }
        .mapNotNull { node -> nameAndType(node)?.let { (name, type) -> Triple(name, type, node) } }
        .groupBy { (name, _, _) -> name }
        .map { (name, overloads) ->
            val usedTypes = overloads.flatMap { (_, _, node) -> UsedTypeExtractor.extract(node, importedNames) }.toSet()
            val isFileScoped = overloads.all { (_, _, node) -> KotlinScopes.isFileScoped(node) }
            Declaration(name = name, type = overloads.first().second, usedTypes = usedTypes, isFileScoped = isFileScoped)
        }

    fun holdsCode(rootNode: SyntaxNode): Boolean = rootNode.namedChildren().any { it.type !in NODES_WITHOUT_CODE }

    private fun nameAndType(node: SyntaxNode): Pair<String, DeclarationType>? {
        val declared = when (node.type) {
            FUNCTION_DECLARATION -> childText(node, SIMPLE_IDENTIFIER) to DeclarationType.FUNCTION
            PROPERTY_DECLARATION -> propertyName(node) to DeclarationType.VARIABLE
            TYPE_ALIAS -> childText(node, TYPE_IDENTIFIER) to DeclarationType.CLASS
            else -> return null
        }
        val name = declared.first?.takeIf { it.isNotBlank() } ?: return null
        return name to declared.second
    }

    private fun propertyName(property: SyntaxNode): String? =
        property.children().firstOrNull { it.type == VARIABLE_DECLARATION }?.let { childText(it, SIMPLE_IDENTIFIER) }

    private fun childText(node: SyntaxNode, type: String): String? = node.children().firstOrNull { it.type == type }?.text?.trim()
}
