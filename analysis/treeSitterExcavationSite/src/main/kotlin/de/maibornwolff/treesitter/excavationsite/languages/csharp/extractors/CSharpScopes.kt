package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

internal object CSharpScopes {
    private const val TYPE_PARAMETER_LIST = "type_parameter_list"
    private const val TYPE_PARAMETER = "type_parameter"
    private const val IDENTIFIER = "identifier"
    private const val MODIFIER = "modifier"
    private const val FILE_MODIFIER = "file"

    val TYPE_DECLARATIONS = setOf(
        "class_declaration",
        "struct_declaration",
        "record_declaration",
        "interface_declaration",
        "enum_declaration",
        "delegate_declaration"
    )

    /** Whether a written type name means a type parameter of a declaration or method around it, which no file can name. */
    fun isTypeParameter(occurrence: SyntaxNode, name: String): Boolean = occurrence.ancestors().any { owner ->
        owner
            .children()
            .filter { it.type == TYPE_PARAMETER_LIST }
            .flatMap { it.children() }
            .any { parameter ->
                parameter.type == TYPE_PARAMETER && parameter.children().firstOrNull { it.type == IDENTIFIER }?.text == name
            }
    }

    /** Whether a type is a `file` type or nested in one, which only its own file can name. */
    fun isFileScoped(declaration: SyntaxNode): Boolean = (sequenceOf(declaration) + declaration.ancestors())
        .filter { it.type in TYPE_DECLARATIONS }
        .any { type -> type.children().any { it.type == MODIFIER && it.text.trim() == FILE_MODIFIER } }

    /** Whether a node belongs to the declaration and not to a type nested in it, which is a declaration of its own. */
    fun belongsTo(node: SyntaxNode, declaration: SyntaxNode): Boolean =
        node.ancestors().firstOrNull { it.type in TYPE_DECLARATIONS } == declaration
}
