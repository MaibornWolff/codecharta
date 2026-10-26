package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/** The names of the classes, structs, unions and enums around a node, the outermost first. */
internal object EnclosingClasses {
    private const val TYPE_IDENTIFIER = "type_identifier"
    private val SPECIFIERS = setOf("class_specifier", "struct_specifier", "union_specifier", "enum_specifier")

    fun of(node: SyntaxNode): List<String> {
        val classes = mutableListOf<String>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type in SPECIFIERS) TreeTraversal.findFirstChildTextByType(current, TYPE_IDENTIFIER)?.let { classes.add(0, it) }
            current = current.parent
        }
        return classes
    }
}
