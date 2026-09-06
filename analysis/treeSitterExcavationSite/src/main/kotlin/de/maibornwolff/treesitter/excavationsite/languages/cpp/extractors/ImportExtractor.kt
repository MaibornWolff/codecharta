package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object ImportExtractor {
    private const val PREPROC_INCLUDE = "preproc_include"
    private const val USING_DECLARATION = "using_declaration"
    private const val SYSTEM_LIB_STRING = "system_lib_string"
    private const val STRING_LITERAL = "string_literal"
    private const val IDENTIFIER = "identifier"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private const val NAMESPACE_KEYWORD = "namespace"
    private const val NAMESPACE_SEPARATOR = "::"
    private const val PATH_SEPARATOR = "/"
    private val LINE_CONTINUATION = Regex("""\\\s*\n\s*""")

    private const val NAMESPACE_DEFINITION = "namespace_definition"

    private val CLASS_SCOPES = setOf(
        "class_specifier",
        "struct_specifier",
        "union_specifier",
        "base_class_clause"
    )
    private val LOCAL_SCOPES = setOf(
        "function_definition",
        "compound_statement"
    )

    fun extract(rootNode: TSNode, sourceCode: String): List<ImportDeclaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, PREPROC_INCLUDE, USING_DECLARATION)
        .mapNotNull { node ->
            when (node.type) {
                PREPROC_INCLUDE -> toIncludeImport(node, sourceCode)
                USING_DECLARATION -> toUsingImport(node, sourceCode)
                else -> null
            }
        }

    private fun toIncludeImport(node: TSNode, sourceCode: String): ImportDeclaration? {
        val rawPath = TreeTraversal.findFirstChildTextByType(node, sourceCode, SYSTEM_LIB_STRING, STRING_LITERAL)
            ?: return null
        val cleanedPath = stripPathDelimiters(rawPath).replace(LINE_CONTINUATION, "")
        val segments = cleanedPath.split(PATH_SEPARATOR).filter { it.isNotEmpty() }
        return ImportDeclaration(path = segments, isWildcard = false, kind = ImportKind.INCLUDE)
    }

    private fun toUsingImport(node: TSNode, sourceCode: String): ImportDeclaration? {
        if (TreeTraversal.hasAncestorOfTypes(node, *CLASS_SCOPES.toTypedArray())) return null
        if (isOrphanedLocalScope(node)) return null
        val namespacePath = CppNamespaceWalker.walkAncestorsFrom(node, sourceCode)
        return if (isUsingDirective(node)) {
            toUsingDirective(node, sourceCode, namespacePath)
        } else {
            toUsingDeclaration(node, sourceCode, namespacePath)
        }
    }

    // A function/block-scope using outside any namespace has no enclosing scope to attach to.
    private fun isOrphanedLocalScope(node: TSNode): Boolean {
        val isLocal = TreeTraversal.hasAncestorOfTypes(node, *LOCAL_SCOPES.toTypedArray())
        return isLocal && !TreeTraversal.hasAncestorOfTypes(node, NAMESPACE_DEFINITION)
    }

    private fun toUsingDirective(node: TSNode, sourceCode: String, namespacePath: List<String>): ImportDeclaration? {
        val nameText = TreeTraversal.findFirstChildTextByType(node, sourceCode, QUALIFIED_IDENTIFIER, IDENTIFIER)
            ?: return null
        return ImportDeclaration(
            path = splitNamespacePath(nameText),
            isWildcard = true,
            namespacePath = namespacePath
        )
    }

    private fun toUsingDeclaration(node: TSNode, sourceCode: String, namespacePath: List<String>): ImportDeclaration? {
        val qualifiedName = TreeTraversal.findFirstChildTextByType(node, sourceCode, QUALIFIED_IDENTIFIER)
            ?: return null
        return ImportDeclaration(
            path = splitNamespacePath(qualifiedName),
            isWildcard = false,
            namespacePath = namespacePath
        )
    }

    private fun isUsingDirective(node: TSNode): Boolean = node.children().any { it.type == NAMESPACE_KEYWORD }

    private fun splitNamespacePath(qualifiedName: String): List<String> =
        qualifiedName.split(NAMESPACE_SEPARATOR).filter { it.isNotEmpty() }

    private fun stripPathDelimiters(raw: String): String = raw.trim('<', '>', '"')
}
