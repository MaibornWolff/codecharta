package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.LocalTypeScopes

internal object JavaScopes {
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
}
