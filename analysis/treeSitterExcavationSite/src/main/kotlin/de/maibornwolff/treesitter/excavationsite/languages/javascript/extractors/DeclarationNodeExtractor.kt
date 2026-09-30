package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_ALIAS_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.VARIABLE_DECLARATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.ABSTRACT_CLASS_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.CLASS_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.ENUM_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.FUNCTION_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.FUNCTION_SIGNATURE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.GENERATOR_FUNCTION_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.INTERFACE_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.INTERNAL_MODULE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.LEXICAL_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.VARIABLE_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationNodes.extractName
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal data class DeclarationScope(val sourceCode: String, val aliasMap: Map<String, String>, val localDeclarationNames: Set<String>)

internal object DeclarationNodeExtractor {
    fun extract(node: TSNode, scope: DeclarationScope, parentPath: List<String> = emptyList()): List<Declaration> = when (node.type) {
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> extractVariableDeclarations(node, scope, parentPath)
        INTERNAL_MODULE -> {
            val name = extractName(node, scope.sourceCode)
            listOf(Declaration(name = name, type = DeclarationType.UNKNOWN, usedTypes = emptySet(), parentPath = parentPath))
        }
        else -> {
            val name = extractName(node, scope.sourceCode)
            val type = declarationType(node.type)
            val usedTypes = UsedTypeExtractor.extract(node, scope.sourceCode, scope.aliasMap, scope.localDeclarationNames - name)
            listOf(Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath))
        }
    }

    private fun extractVariableDeclarations(node: TSNode, scope: DeclarationScope, parentPath: List<String>): List<Declaration> = node
        .children()
        .filter { it.type == VARIABLE_DECLARATOR }
        .mapNotNull { declarator ->
            val name = TreeTraversal.findFirstChildTextByType(declarator, scope.sourceCode, IDENTIFIER)?.trim()
            if (name.isNullOrBlank()) {
                null
            } else {
                Declaration(
                    name = name,
                    type = DeclarationType.VARIABLE,
                    usedTypes = UsedTypeExtractor.extract(declarator, scope.sourceCode, scope.aliasMap, scope.localDeclarationNames - name),
                    parentPath = parentPath
                )
            }
        }.toList()

    private fun declarationType(nodeType: String): DeclarationType = when (nodeType) {
        CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION, TYPE_ALIAS_DECLARATION -> DeclarationType.CLASS
        INTERFACE_DECLARATION -> DeclarationType.INTERFACE
        ENUM_DECLARATION -> DeclarationType.ENUM
        FUNCTION_DECLARATION, FUNCTION_SIGNATURE, GENERATOR_FUNCTION_DECLARATION -> DeclarationType.FUNCTION
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> DeclarationType.VARIABLE
        else -> DeclarationType.UNKNOWN
    }
}
