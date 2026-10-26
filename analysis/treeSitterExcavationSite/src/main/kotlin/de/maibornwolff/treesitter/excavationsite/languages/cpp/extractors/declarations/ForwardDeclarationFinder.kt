package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The forward declarations of a file (`class Creature;`): a class, struct, union or enum without a body that stands
 * as a declaration of its own, reported below [FORWARD_DECLARATION] plus its namespaces and enclosing classes, as it
 * declares no leaf but makes its name visible.
 */
internal object ForwardDeclarationFinder {
    const val FORWARD_DECLARATION = "FORWARD_DECLARATION"

    private const val ENUM_SPECIFIER = "enum_specifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val FIELD_DECLARATION = "field_declaration"
    private val SPECIFIERS = arrayOf("class_specifier", "struct_specifier", "union_specifier", ENUM_SPECIFIER)
    private val BODIES = setOf("field_declaration_list", "enumerator_list")
    private val STANDALONE_PARENTS = setOf(
        "translation_unit",
        "declaration_list",
        "template_declaration",
        "preproc_if",
        "preproc_ifdef",
        "preproc_else",
        "preproc_elif"
    )

    fun find(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, *SPECIFIERS)
        .filter { isForwardDeclaration(it) }
        .mapNotNull { toDeclaration(it) }

    private fun isForwardDeclaration(specifier: SyntaxNode): Boolean {
        if (specifier.children().any { it.type in BODIES }) return false
        val parent = specifier.parent
        return parent.type in STANDALONE_PARENTS || (parent.type == FIELD_DECLARATION && parent.namedChildCount == 1)
    }

    private fun toDeclaration(specifier: SyntaxNode): Declaration? {
        val name = TreeTraversal.findFirstChildTextByType(specifier, TYPE_IDENTIFIER) ?: return null
        return Declaration(
            name = name,
            type = if (specifier.type == ENUM_SPECIFIER) DeclarationType.ENUM else DeclarationType.CLASS,
            usedTypes = emptySet(),
            parentPath = listOf(FORWARD_DECLARATION) + CppNamespaceWalker.walkAncestorsFrom(specifier) + enclosingClasses(specifier)
        )
    }

    private fun enclosingClasses(specifier: SyntaxNode): List<String> {
        val classes = mutableListOf<String>()
        var current = specifier.parent
        while (!current.isNull) {
            if (current.type in SPECIFIERS) TreeTraversal.findFirstChildTextByType(current, TYPE_IDENTIFIER)?.let { classes.add(0, it) }
            current = current.parent
        }
        return classes
    }
}
