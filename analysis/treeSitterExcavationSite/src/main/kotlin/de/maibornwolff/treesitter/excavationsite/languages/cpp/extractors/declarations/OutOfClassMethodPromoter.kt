package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.syntax.CppNamespaceWalker
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.UsedTypeExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object OutOfClassMethodPromoter {
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val FUNCTION_DECLARATOR = "function_declarator"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"

    fun promote(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, FUNCTION_DEFINITION)
        .mapNotNull { toOutOfClassDeclaration(it) }

    private fun toOutOfClassDeclaration(functionDef: SyntaxNode): Declaration? {
        val qualifiedDeclarator = findQualifiedDeclarator(functionDef) ?: return null
        val enclosing = CppTypeHelper.extractSecondToLastSegment(qualifiedDeclarator) ?: return null
        return Declaration(
            name = enclosing.name,
            type = DeclarationType.CLASS,
            usedTypes = UsedTypeExtractor.extract(functionDef),
            parentPath = CppNamespaceWalker.walkAncestorsFrom(functionDef) + enclosing.namespacePrefix
        )
    }

    private fun findQualifiedDeclarator(functionDef: SyntaxNode): SyntaxNode? {
        val fnDeclarator = functionDef.children().firstOrNull { it.type == FUNCTION_DECLARATOR } ?: return null
        return fnDeclarator.children().firstOrNull { it.type == QUALIFIED_IDENTIFIER }
    }
}
