package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppNamespaceWalker
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.UsedTypeExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object OutOfClassMethodPromoter {
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val FUNCTION_DECLARATOR = "function_declarator"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"

    fun promote(rootNode: TSNode, sourceCode: String): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, FUNCTION_DEFINITION)
        .mapNotNull { toOutOfClassDeclaration(it, sourceCode) }

    private fun toOutOfClassDeclaration(functionDef: TSNode, sourceCode: String): Declaration? {
        val qualifiedDeclarator = findQualifiedDeclarator(functionDef) ?: return null
        val enclosing = CppTypeHelper.extractSecondToLastSegment(qualifiedDeclarator, sourceCode) ?: return null
        return Declaration(
            name = enclosing.name,
            type = DeclarationType.CLASS,
            usedTypes = UsedTypeExtractor.extract(functionDef, sourceCode),
            parentPath = CppNamespaceWalker.walkAncestorsFrom(functionDef, sourceCode) + enclosing.namespacePrefix
        )
    }

    private fun findQualifiedDeclarator(functionDef: TSNode): TSNode? {
        val fnDeclarator = functionDef.children().firstOrNull { it.type == FUNCTION_DECLARATOR } ?: return null
        return fnDeclarator.children().firstOrNull { it.type == QUALIFIED_IDENTIFIER }
    }
}
