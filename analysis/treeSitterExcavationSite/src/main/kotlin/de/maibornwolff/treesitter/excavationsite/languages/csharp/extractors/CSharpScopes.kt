package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

internal object CSharpScopes {
    val TYPE_DECLARATIONS = setOf(
        "class_declaration",
        "struct_declaration",
        "record_declaration",
        "interface_declaration",
        "enum_declaration",
        "delegate_declaration"
    )

    /** Whether a node belongs to the declaration and not to a type nested in it, which is a declaration of its own. */
    fun belongsTo(node: SyntaxNode, declaration: SyntaxNode): Boolean =
        node.ancestors().firstOrNull { it.type in TYPE_DECLARATIONS } == declaration
}
