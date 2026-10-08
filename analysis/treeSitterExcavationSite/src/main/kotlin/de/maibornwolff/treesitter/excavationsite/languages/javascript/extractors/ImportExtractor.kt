package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.CALL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_CLAUSE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_SPECIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IMPORT_CLAUSE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IMPORT_SPECIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IMPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.NAMED_IMPORTS
import de.maibornwolff.treesitter.excavationsite.languages.javascript.NAMESPACE_IMPORT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.OBJECT_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.PAIR_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.PROPERTY_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.REQUIRE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.SHORTHAND_PROPERTY_IDENTIFIER_PATTERN
import de.maibornwolff.treesitter.excavationsite.languages.javascript.STRING
import de.maibornwolff.treesitter.excavationsite.languages.javascript.VARIABLE_DECLARATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.normalizeDefaultKeyword
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object ImportExtractor {
    private const val ARGUMENTS = "arguments"
    private const val TEMPLATE_STRING = "template_string"
    private const val IMPORT_KEYWORD = "import"
    private const val PATH_SEPARATOR = "/"

    private fun splitPath(pathText: String): List<String> = pathText.split(PATH_SEPARATOR)

    fun extract(rootNode: SyntaxNode): List<ImportDeclaration> {
        val es6Imports = extractEs6Imports(rootNode)
        val commonJsImports = extractCommonJsImports(rootNode)
        val namedReexports = extractNamedReexports(rootNode)
        val wildcardReexports = extractWildcardReexports(rootNode)
        val dynamicImports = extractDynamicImports(rootNode)
        return es6Imports + commonJsImports + namedReexports + wildcardReexports + dynamicImports
    }

    private fun extractEs6Imports(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, IMPORT_STATEMENT)
        .flatMap { importNode ->
            val pathText = extractStringText(importNode) ?: return@flatMap emptyList()
            val basePath = splitPath(pathText)
            val importClause = importNode.children().firstOrNull { it.type == IMPORT_CLAUSE }
                ?: return@flatMap listOf(ImportDeclaration(path = basePath, isWildcard = false))
            when {
                TreeTraversal.containsNodeOfType(importClause, NAMESPACE_IMPORT) -> {
                    val nsName = importClause
                        .children()
                        .firstOrNull { it.type == NAMESPACE_IMPORT }
                        ?.children()
                        ?.firstOrNull { it.type == IDENTIFIER }
                        ?.text
                        ?.trim()
                    listOf(ImportDeclaration(path = basePath, isWildcard = true, bindingName = nsName))
                }
                else -> {
                    val named = extractNamedSpecifiers(importClause, basePath)
                    val defaultIdentifier = importClause.children().firstOrNull { it.type == IDENTIFIER }
                    if (defaultIdentifier != null) {
                        val bindingText = defaultIdentifier.text.trim()
                        named + ImportDeclaration(path = basePath + DEFAULT_EXPORT, isWildcard = false, bindingName = bindingText)
                    } else {
                        named
                    }
                }
            }
        }

    private fun extractNamedSpecifiers(importClause: SyntaxNode, basePath: List<String>): List<ImportDeclaration> {
        val namedImports = importClause.children().firstOrNull { it.type == NAMED_IMPORTS }
            ?: return emptyList()
        return namedImports
            .children()
            .filter { it.type == IMPORT_SPECIFIER }
            .mapNotNull { specifier ->
                val identifiers = specifier
                    .children()
                    .filter { it.type == IDENTIFIER }
                    .map { it.text.trim() }
                    .toList()
                when (identifiers.size) {
                    1 -> ImportDeclaration(path = basePath + identifiers[0], isWildcard = false, bindingName = identifiers[0])
                    2 -> ImportDeclaration(path = basePath + identifiers[0], isWildcard = false, bindingName = identifiers[1])
                    else -> null
                }
            }.toList()
    }

    private fun extractCommonJsImports(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, CALL_EXPRESSION)
        .flatMap { callNode ->
            val callee = callNode.children().firstOrNull { it.type == IDENTIFIER }
                ?: return@flatMap emptyList()
            val calleeName = callee.text.trim()
            if (calleeName != REQUIRE) return@flatMap emptyList()
            val args = callNode.children().firstOrNull { it.type == ARGUMENTS }
                ?: return@flatMap emptyList()
            val pathText = extractStringText(args) ?: return@flatMap emptyList()
            val basePath = splitPath(pathText)
            val declarator = callNode.parent
            if (declarator.isNull || declarator.type != VARIABLE_DECLARATOR) {
                return@flatMap listOf(ImportDeclaration(path = basePath + DEFAULT_EXPORT, isWildcard = false))
            }
            val nameChild = declarator.children().firstOrNull { it.type == OBJECT_PATTERN || it.type == IDENTIFIER }
            when (nameChild?.type) {
                OBJECT_PATTERN -> extractDestructuredCommonJs(nameChild, basePath)
                IDENTIFIER -> {
                    val bindingText = nameChild.text.trim()
                    listOf(ImportDeclaration(path = basePath + DEFAULT_EXPORT, isWildcard = false, bindingName = bindingText))
                }
                else -> listOf(ImportDeclaration(path = basePath + DEFAULT_EXPORT, isWildcard = false))
            }
        }

    private fun extractNamedReexports(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, EXPORT_STATEMENT)
        .filter { exportNode -> TreeTraversal.containsNodeOfType(exportNode, EXPORT_CLAUSE) }
        .flatMap { exportNode ->
            val pathText = extractStringText(exportNode) ?: return@flatMap emptyList()
            val basePath = splitPath(pathText)
            val exportClause = exportNode.children().firstOrNull { it.type == EXPORT_CLAUSE }
                ?: return@flatMap emptyList()
            exportClause
                .children()
                .filter { it.type == EXPORT_SPECIFIER }
                .mapNotNull { specifier ->
                    val rawName = specifier
                        .children()
                        .firstOrNull { it.type == IDENTIFIER }
                        ?.text
                        ?.trim()
                        ?: return@mapNotNull null
                    val name = normalizeDefaultKeyword(rawName)
                    ImportDeclaration(path = basePath + name, isWildcard = false)
                }.toList()
        }

    private fun extractWildcardReexports(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, EXPORT_STATEMENT)
        .filter { exportNode ->
            exportNode.children().any { it.type == STRING } &&
                !TreeTraversal.containsNodeOfType(exportNode, EXPORT_CLAUSE)
        }.mapNotNull { exportNode ->
            val pathText = extractStringText(exportNode) ?: return@mapNotNull null
            ImportDeclaration(path = splitPath(pathText), isWildcard = true)
        }

    private fun extractDynamicImports(rootNode: SyntaxNode): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, CALL_EXPRESSION)
        .mapNotNull { callNode ->
            if (callNode.children().none { it.type == IMPORT_KEYWORD }) return@mapNotNull null
            val args = callNode.children().firstOrNull { it.type == ARGUMENTS }
                ?: return@mapNotNull null
            val pathText = extractStringText(args) ?: return@mapNotNull null
            ImportDeclaration(path = splitPath(pathText), isWildcard = false)
        }

    private fun extractDestructuredCommonJs(objectPattern: SyntaxNode, basePath: List<String>): List<ImportDeclaration> = objectPattern
        .children()
        .mapNotNull { prop ->
            when (prop.type) {
                SHORTHAND_PROPERTY_IDENTIFIER_PATTERN -> {
                    val name = prop.text.trim()
                    if (name.isBlank()) {
                        null
                    } else {
                        ImportDeclaration(path = basePath + name, isWildcard = false, bindingName = name)
                    }
                }
                PAIR_PATTERN -> {
                    val children = prop.children().toList()
                    val realName = children
                        .firstOrNull { it.type == IDENTIFIER || it.type == PROPERTY_IDENTIFIER }
                        ?.text
                        ?.trim()
                    val binding = children
                        .lastOrNull { it.type == IDENTIFIER }
                        ?.text
                        ?.trim()
                    if (realName.isNullOrBlank()) {
                        null
                    } else {
                        ImportDeclaration(
                            path = basePath + realName,
                            isWildcard = false,
                            bindingName = binding?.takeIf { it.isNotBlank() } ?: realName
                        )
                    }
                }
                else -> null
            }
        }.toList()

    private fun extractStringText(node: SyntaxNode): String? {
        val stringNode = node.children().firstOrNull { it.type == STRING || it.type == TEMPLATE_STRING }
            ?: return null
        val raw = stringNode.text.trim()
        return raw.removeSurrounding("\"").removeSurrounding("'").removeSurrounding("`")
    }
}
