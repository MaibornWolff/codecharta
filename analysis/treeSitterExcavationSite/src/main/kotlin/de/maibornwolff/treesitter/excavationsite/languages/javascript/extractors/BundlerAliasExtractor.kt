package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.AliasPathStart
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Reads the module aliases of a webpack, vite or vue-cli configuration: `resolve.alias`, or
 * `configureWebpack.resolve.alias` where that is missing, of the object the file exports with `module.exports =`
 * or `export default`. A configuration wrapped in a call, such as `defineConfig({…})`, or built from variables is
 * not read.
 */
internal object BundlerAliasExtractor {
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private const val ASSIGNMENT_EXPRESSION = "assignment_expression"
    private const val MEMBER_EXPRESSION = "member_expression"
    private const val EXPORT_STATEMENT = "export_statement"
    private const val STRING = "string"
    private const val IDENTIFIER = "identifier"
    private const val PROPERTY_IDENTIFIER = "property_identifier"
    private const val CALL_EXPRESSION = "call_expression"
    private const val LEFT_FIELD = "left"
    private const val RIGHT_FIELD = "right"
    private const val KEY_FIELD = "key"
    private const val FUNCTION_FIELD = "function"
    private const val ARGUMENTS_FIELD = "arguments"
    private const val MODULE_EXPORTS = "module.exports"
    private const val ES_DEFAULT_EXPORT_PREFIX = "export default"
    private const val RESOLVE = "resolve"
    private const val ALIAS = "alias"
    private const val CONFIGURE_WEBPACK = "configureWebpack"
    private const val PATH_RESOLVE = "path.resolve"
    private const val DIRNAME = "__dirname"
    private val EXPORTED_VALUE_TYPES = setOf(OBJECT, CALL_EXPRESSION, IDENTIFIER)

    fun extract(rootNode: SyntaxNode): List<BundlerAlias> {
        val statements = rootNode.namedChildren().toList()
        val config = commonJsExport(statements) ?: esDefaultExport(statements) ?: return emptyList()
        val aliases = aliasObjectOf(config) ?: propertyOf(config, CONFIGURE_WEBPACK)?.let { aliasObjectOf(it) } ?: return emptyList()
        return pairsOf(aliases).mapNotNull { pair -> toAlias(pair) }
    }

    private fun commonJsExport(statements: List<SyntaxNode>): SyntaxNode? = statements
        .filter { it.type == EXPRESSION_STATEMENT }
        .mapNotNull { statement -> statement.namedChildren().firstOrNull { it.type == ASSIGNMENT_EXPRESSION } }
        .firstOrNull { assignment -> isModuleExports(assignment.getChildByFieldName(LEFT_FIELD)) }
        ?.getChildByFieldName(RIGHT_FIELD)

    private fun isModuleExports(node: SyntaxNode): Boolean = !node.isNull && node.type == MEMBER_EXPRESSION && node.text == MODULE_EXPORTS

    private fun esDefaultExport(statements: List<SyntaxNode>): SyntaxNode? = statements
        .filter { it.type == EXPORT_STATEMENT && it.text.startsWith(ES_DEFAULT_EXPORT_PREFIX) }
        .firstNotNullOfOrNull { export -> export.namedChildren().firstOrNull { it.type in EXPORTED_VALUE_TYPES } }

    private fun aliasObjectOf(config: SyntaxNode): SyntaxNode? = propertyOf(config, RESOLVE)?.let { propertyOf(it, ALIAS) }

    private fun propertyOf(objectNode: SyntaxNode, propertyName: String): SyntaxNode? =
        pairsOf(objectNode).firstOrNull { keyOf(it) == propertyName }?.getChildByFieldName(VALUE_FIELD)?.orNull()

    private fun pairsOf(objectNode: SyntaxNode): List<SyntaxNode> {
        if (objectNode.isNull || objectNode.type != OBJECT) return emptyList()
        return objectNode.namedChildren().filter { it.type == PAIR }.toList()
    }

    private fun keyOf(pair: SyntaxNode): String? {
        val key = pair.getChildByFieldName(KEY_FIELD).orNull() ?: return null
        return when (key.type) {
            PROPERTY_IDENTIFIER, IDENTIFIER -> key.text
            STRING -> key.text.withoutQuotes()
            else -> null
        }
    }

    private fun toAlias(pair: SyntaxNode): BundlerAlias? {
        val name = keyOf(pair) ?: return null
        val value = pair.getChildByFieldName(VALUE_FIELD).orNull() ?: return null
        return when (value.type) {
            STRING -> BundlerAlias(name, listOf(value.text.withoutQuotes()), AliasPathStart.AS_WRITTEN)
            CALL_EXPRESSION -> aliasOfResolvedPath(name, value)
            else -> null
        }
    }

    private fun aliasOfResolvedPath(name: String, call: SyntaxNode): BundlerAlias? {
        if (call.getChildByFieldName(FUNCTION_FIELD).orNull()?.text != PATH_RESOLVE) return null
        val arguments = call.getChildByFieldName(ARGUMENTS_FIELD).orNull()?.namedChildren()?.toList() ?: return null
        val pathParts = arguments.filter { it.type == STRING }.map { it.text.withoutQuotes() }
        if (pathParts.isEmpty()) return null
        val startsAtConfigDirectory = arguments.any { it.type == IDENTIFIER && it.text == DIRNAME }
        val pathStart = if (startsAtConfigDirectory) AliasPathStart.CONFIG_DIRECTORY else AliasPathStart.WORKING_DIRECTORY
        return BundlerAlias(name, pathParts, pathStart)
    }

    private fun String.withoutQuotes(): String = trim('"', '\'')
}
