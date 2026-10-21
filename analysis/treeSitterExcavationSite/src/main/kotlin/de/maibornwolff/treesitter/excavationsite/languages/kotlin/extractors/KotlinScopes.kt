package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.LocalTypeScopes
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

internal object KotlinScopes {
    // Statements directly in a script file are its top level, not a block
    val LOCAL_TYPES = LocalTypeScopes(
        typeParameterOwners = setOf("class_declaration", "function_declaration", "property_declaration"),
        isBlock = { it.type == "statements" && it.parent.type != "source_file" },
        localClass = "class_declaration",
        nameOf = { declaration -> declaration.children().firstOrNull { it.type == "type_identifier" }?.text }
    )

    private val TYPE_DECLARATIONS = setOf("class_declaration", "object_declaration")

    /** Whether a node belongs to the declaration and not to a nested class of it; a local class belongs to its block. */
    fun belongsTo(node: SyntaxNode, declaration: SyntaxNode): Boolean =
        classOf(node) == if (declaration.type in TYPE_DECLARATIONS) declaration else classOf(declaration)

    private fun classOf(node: SyntaxNode): SyntaxNode? = node.ancestors().firstOrNull {
        it.type in TYPE_DECLARATIONS &&
            !LOCAL_TYPES.isLocalClass(it)
    }
}
