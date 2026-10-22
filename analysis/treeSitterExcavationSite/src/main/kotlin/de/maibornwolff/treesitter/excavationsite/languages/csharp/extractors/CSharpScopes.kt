package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

internal object CSharpScopes {
    val TYPE_DECLARATIONS = setOf(
        "class_declaration",
        "struct_declaration",
        "record_declaration",
        "interface_declaration",
        "enum_declaration",
        "delegate_declaration"
    )
}
