package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/** Whether a class, struct, union or enum specifier is a forward declaration: no body, and a declaration of its own. */
internal object CppForwardDeclarations {
    private const val FIELD_DECLARATION = "field_declaration"
    private val BODIES = setOf("field_declaration_list", "enumerator_list")
    private val STANDALONE_PARENTS = setOf(
        "translation_unit",
        "type_definition",
        "declaration_list",
        "template_declaration",
        "preproc_if",
        "preproc_ifdef",
        "preproc_else",
        "preproc_elif"
    )

    fun isForwardDeclaration(specifier: SyntaxNode): Boolean {
        if (specifier.children().any { it.type in BODIES }) return false
        val parent = specifier.parent
        return parent.type in STANDALONE_PARENTS || (parent.type == FIELD_DECLARATION && parent.namedChildCount == 1)
    }
}
