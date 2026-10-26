package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax.CppNamespaceWalker
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.UsedTypeExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The explicit and partial specializations of a file (`template <> class Repository<Centaur> { ... }`), each as a
 * declaration of its template's name that uses its body's types and its template arguments; decision 8 of `cpp.md` makes
 * it an implementation part of the template.
 */
internal object SpecializationFinder {
    private const val TEMPLATE_TYPE = "template_type"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val TEMPLATE_ARGUMENT_LIST = "template_argument_list"
    private const val NAME_FIELD = "name"
    private val CLASS_SPECIFIERS = arrayOf("class_specifier", "struct_specifier", "union_specifier")
    private val BODIES = setOf("field_declaration_list")

    fun find(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, *CLASS_SPECIFIERS)
        .filter { specifier -> specifier.children().any { it.type in BODIES } }
        .mapNotNull { specifier ->
            specifier
                .getChildByFieldName(
                    NAME_FIELD
                ).takeIf { !it.isNull && it.type == TEMPLATE_TYPE }
                ?.let { toDeclaration(specifier, it) }
        }

    private fun toDeclaration(specifier: SyntaxNode, templateType: SyntaxNode): Declaration? {
        val name = TreeTraversal.findFirstChildTextByType(templateType, TYPE_IDENTIFIER) ?: return null
        val arguments = templateType
            .children()
            .filter { it.type == TEMPLATE_ARGUMENT_LIST }
            .flatMap { it.namedChildren() }
            .mapNotNull { argument -> CppTypeHelper.extractType(argument.namedChildren().firstOrNull() ?: argument) }
        return Declaration(
            name = name,
            type = DeclarationType.CLASS,
            usedTypes = UsedTypeExtractor.extract(specifier) + arguments,
            parentPath = CppNamespaceWalker.walkAncestorsFrom(specifier) + EnclosingClasses.of(specifier)
        )
    }
}
