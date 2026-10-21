package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.LocalTypeScopes
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

internal object KotlinScopes {
    // Statements directly in a script file are its top level, not a block
    val LOCAL_TYPES = LocalTypeScopes(
        typeParameterOwners = setOf("class_declaration", "function_declaration", "property_declaration"),
        isBlock = { it.type == "statements" && it.parent.type != "source_file" },
        localClass = "class_declaration",
        nameOf = { declaration -> declaration.children().firstOrNull { it.type == "type_identifier" }?.text }
    )

    private val TYPE_DECLARATIONS = setOf("class_declaration", "object_declaration")
    private const val SOURCE_FILE = "source_file"
    private const val MODIFIERS = "modifiers"
    private const val VISIBILITY_MODIFIER = "visibility_modifier"
    private const val PRIVATE = "private"

    /** Whether the top-level declaration a node lies in is `private`, which makes it visible in its own file only. */
    fun isFileScoped(node: SyntaxNode): Boolean {
        val topLevel = (sequenceOf(node) + node.ancestors()).firstOrNull { it.parent.orNull()?.type == SOURCE_FILE } ?: return false
        return topLevel
            .children()
            .filter { it.type == MODIFIERS }
            .flatMap { it.children() }
            .any { it.type == VISIBILITY_MODIFIER && it.text.trim() == PRIVATE }
    }

    /** Whether a node belongs to the declaration and not to a nested class of it; a local class belongs to its block. */
    fun belongsTo(node: SyntaxNode, declaration: SyntaxNode): Boolean =
        classOf(node) == if (declaration.type in TYPE_DECLARATIONS) declaration else classOf(declaration)

    private fun classOf(node: SyntaxNode): SyntaxNode? = node.ancestors().firstOrNull {
        it.type in TYPE_DECLARATIONS &&
            !LOCAL_TYPES.isLocalClass(it)
    }
}
