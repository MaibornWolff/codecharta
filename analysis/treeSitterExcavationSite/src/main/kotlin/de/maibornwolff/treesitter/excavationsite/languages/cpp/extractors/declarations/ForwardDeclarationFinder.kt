package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The forward declarations of a file (`class Creature;`, the tag of `typedef struct Stable Stable;`): a class, struct,
 * union or enum without a body that stands as a declaration of its own or in a typedef, reported below
 * [FORWARD_DECLARATION] plus its namespaces and enclosing classes, as it declares no leaf but makes its name visible.
 * An unqualified `friend class Util;` declares `Util` in the innermost namespace around it, as the compiler reads it.
 */
internal object ForwardDeclarationFinder {
    const val FORWARD_DECLARATION = "FORWARD_DECLARATION"

    private const val ENUM_SPECIFIER = "enum_specifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val FIELD_DECLARATION = "field_declaration"
    private const val FRIEND_DECLARATION = "friend_declaration"
    private val CLASS_KEYWORDS = setOf("class", "struct", "union")
    private val SPECIFIERS = arrayOf("class_specifier", "struct_specifier", "union_specifier", ENUM_SPECIFIER)
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

    fun find(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, *SPECIFIERS)
        .filter { isForwardDeclaration(it) }
        .mapNotNull { toDeclaration(it) } + friendClasses(rootNode)

    private fun friendClasses(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, FRIEND_DECLARATION)
        .filter { friend -> friend.children().any { it.type in CLASS_KEYWORDS } }
        .mapNotNull { friend ->
            TreeTraversal.findFirstChildTextByType(friend, TYPE_IDENTIFIER)?.let { name ->
                Declaration(
                    name = name,
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf(FORWARD_DECLARATION) + CppNamespaceWalker.walkAncestorsFrom(friend)
                )
            }
        }

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
            parentPath = listOf(FORWARD_DECLARATION) + CppNamespaceWalker.walkAncestorsFrom(specifier) + EnclosingClasses.of(specifier)
        )
    }
}
