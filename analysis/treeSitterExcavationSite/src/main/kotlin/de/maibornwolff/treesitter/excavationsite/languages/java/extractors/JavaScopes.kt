package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

internal object JavaScopes {
    val TYPE_DECLARATIONS = setOf(
        "class_declaration",
        "record_declaration",
        "interface_declaration",
        "enum_declaration",
        "annotation_type_declaration"
    )

    private val BLOCKS = setOf("block", "constructor_body")

    val LOCAL_TYPES = LocalTypeScopes(
        typeParameterOwners = setOf(
            "class_declaration",
            "interface_declaration",
            "record_declaration",
            "method_declaration",
            "constructor_declaration"
        ),
        isBlock = { it.type in BLOCKS },
        localClass = "class_declaration",
        nameOf = { it.getChildByFieldName("name").text }
    )

    /** The member type a node is written in: a local class does not count, its code belongs to the type around it. */
    fun memberTypeOf(node: SyntaxNode): SyntaxNode? = node.ancestors().firstOrNull {
        it.type in TYPE_DECLARATIONS &&
            !LOCAL_TYPES.isLocalClass(it)
    }
}
