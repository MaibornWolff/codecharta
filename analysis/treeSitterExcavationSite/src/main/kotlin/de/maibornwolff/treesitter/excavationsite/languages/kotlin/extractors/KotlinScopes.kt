package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.LocalTypeScopes

internal object KotlinScopes {
    // Statements directly in a script file are its top level, not a block
    val LOCAL_TYPES = LocalTypeScopes(
        typeParameterOwners = setOf("class_declaration", "function_declaration", "property_declaration"),
        isBlock = { it.type == "statements" && it.parent.type != "source_file" },
        localClass = "class_declaration",
        nameOf = { declaration -> declaration.children().firstOrNull { it.type == "type_identifier" }?.text }
    )
}
