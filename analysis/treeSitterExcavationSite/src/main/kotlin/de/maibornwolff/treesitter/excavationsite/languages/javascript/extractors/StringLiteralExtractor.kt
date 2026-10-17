package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

private const val IMPORT = "import"
private const val SOURCE_FIELD = "source"

/**
 * Extracts non-import string literals from JavaScript/TypeScript code.
 *
 * Returns null for strings inside import/export statements or require() calls and for the inline template of an
 * Angular component, whose texts are extracted in the template language, allowing them to be skipped during extraction.
 */
internal fun extractNonImportString(node: SyntaxNode): String? {
    if (isImportString(node) || AngularDecoratorExtractor.isInlineTemplate(node)) return null
    val text = node.text
    if (!text.startsWith("\"") && !text.startsWith("'")) return null
    return StringParser.stripAnyQuotes(text)
}

/**
 * Extracts non-import template strings from JavaScript/TypeScript code.
 *
 * Returns null for strings inside import/export statements or require() calls and for the inline template of an
 * Angular component.
 */
internal fun extractNonImportTemplateString(node: SyntaxNode): String? {
    if (isImportString(node) || AngularDecoratorExtractor.isInlineTemplate(node)) return null
    val text = node.text
    return StringParser.stripBackticks(text)
}

// The module of an import and of an `export … from`; an exported declaration and its decorators hold no module strings
private fun isImportString(node: SyntaxNode): Boolean {
    if (TreeTraversal.hasAncestorOfTypes(node, IMPORT_STATEMENT) || isReexportSource(node)) return true

    val callExpr = TreeTraversal.findAncestorOfType(node, CALL_EXPRESSION) ?: return false
    val funcName = TreeTraversal.findFirstChildTextByType(callExpr, "identifier")
        ?: callExpr.getChild(0).orNull()?.text
    return funcName == REQUIRE || funcName == IMPORT
}

private fun isReexportSource(node: SyntaxNode): Boolean {
    val parent = node.parent
    return parent.type == EXPORT_STATEMENT && parent.getChildByFieldName(SOURCE_FIELD) == node
}
