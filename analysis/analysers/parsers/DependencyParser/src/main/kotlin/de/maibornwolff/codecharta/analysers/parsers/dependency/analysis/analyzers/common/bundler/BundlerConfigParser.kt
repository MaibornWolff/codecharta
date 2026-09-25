package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.getNamedChildren
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TreeSitterJavascript
import java.io.File

/**
 * Parses bundler config files (webpack.config.js, vite.config.js, vue.config.js)
 * using Tree-sitter to extract alias mappings.
 */
object BundlerConfigParser {
    private const val RESOLVE = "resolve"
    private const val ALIAS = "alias"
    private const val CONFIGURE_WEBPACK = "configureWebpack"
    private const val PATH_RESOLVE = "path.resolve"
    private const val DIRNAME = "__dirname"
    private const val EXPORT_STATEMENT = "export_statement"
    private const val ES_DEFAULT_EXPORT_PREFIX = "export default"
    private val EXPORTED_VALUE_TYPES = setOf("object", "call_expression", "identifier")

    fun parse(configFile: File): BundlerConfigData? {
        if (!configFile.exists()) {
            return null
        }

        val content = configFile.readText()
        val configDir = configFile.parentFile

        val rootNode = parseJavascript(content)
        val configObject = findConfigObject(rootNode, content) ?: return null
        val aliases = extractAliases(configObject, content, configDir)

        return if (aliases.isEmpty()) null else BundlerConfigData(aliases)
    }

    private fun parseJavascript(code: String): TSNode {
        val parser = TSParser()
        parser.language = TreeSitterJavascript()
        val tree = parser.parseString(null, code)
        return tree.rootNode
    }

    private fun findConfigObject(rootNode: TSNode, content: String): TSNode? {
        // Try CommonJS: module.exports = {...}
        val commonJsConfig = findCommonJsExport(rootNode, content)
        if (commonJsConfig != null) {
            return commonJsConfig
        }

        // Try ES module: export default {...}
        return findEsDefaultExport(rootNode, content)
    }

    private fun findCommonJsExport(rootNode: TSNode, content: String): TSNode? {
        for (child in rootNode.getNamedChildren()) {
            if (child.type == "expression_statement") {
                val assignment = child.getNamedChildren().firstOrNull { it.type == "assignment_expression" }
                if (assignment != null) {
                    val left = assignment.getChildByFieldName("left")
                    if (isModuleExports(left, content)) {
                        return assignment.getChildByFieldName("right")
                    }
                }
            }
        }
        return null
    }

    private fun isModuleExports(node: TSNode, content: String): Boolean {
        if (node.isNull || node.type != "member_expression") {
            return false
        }
        val text = nodeAsString(node, content)
        return text == "module.exports"
    }

    private fun findEsDefaultExport(rootNode: TSNode, content: String): TSNode? = rootNode
        .getNamedChildren()
        .filter { isEsDefaultExport(it, content) }
        .firstNotNullOfOrNull { exportStatement ->
            exportStatement.getNamedChildren().firstOrNull { it.type in EXPORTED_VALUE_TYPES }
        }

    private fun isEsDefaultExport(node: TSNode, content: String): Boolean =
        node.type == EXPORT_STATEMENT && nodeAsString(node, content).startsWith(ES_DEFAULT_EXPORT_PREFIX)

    private fun extractAliases(configObject: TSNode, content: String, configDir: File): Map<String, String> {
        if (configObject.type != "object") {
            return emptyMap()
        }

        // Try resolve.alias directly (webpack, vite)
        val resolveNode = findProperty(configObject, RESOLVE, content)
        if (resolveNode != null) {
            val aliasNode = findProperty(resolveNode, ALIAS, content)
            if (aliasNode != null) {
                return parseAliasObject(aliasNode, content, configDir)
            }
        }

        // Try configureWebpack.resolve.alias (vue.config.js)
        val configureWebpackNode = findProperty(configObject, CONFIGURE_WEBPACK, content)
        if (configureWebpackNode != null) {
            val resolveInWebpack = findProperty(configureWebpackNode, RESOLVE, content)
            if (resolveInWebpack != null) {
                val aliasInWebpack = findProperty(resolveInWebpack, ALIAS, content)
                if (aliasInWebpack != null) {
                    return parseAliasObject(aliasInWebpack, content, configDir)
                }
            }
        }

        return emptyMap()
    }

    private fun findProperty(objectNode: TSNode, propertyName: String, content: String): TSNode? {
        if (objectNode.type != "object") {
            return null
        }

        for (child in objectNode.getNamedChildren()) {
            if (child.type == "pair") {
                val key = child.getChildByFieldName("key")
                val keyText = extractPropertyKey(key, content)
                if (keyText == propertyName) {
                    val value = child.getChildByFieldName("value")
                    return if (value.isNull) null else value
                }
            }
        }
        return null
    }

    private fun extractPropertyKey(keyNode: TSNode, content: String): String? {
        if (keyNode.isNull) {
            return null
        }
        return when (keyNode.type) {
            "property_identifier", "identifier" -> nodeAsString(keyNode, content)
            "string" -> nodeAsString(keyNode, content).trim('"', '\'')
            else -> null
        }
    }

    private fun parseAliasObject(aliasNode: TSNode, content: String, configDir: File): Map<String, String> {
        if (aliasNode.type != "object") {
            return emptyMap()
        }

        val aliases = mutableMapOf<String, String>()

        for (child in aliasNode.getNamedChildren()) {
            if (child.type == "pair") {
                val key = child.getChildByFieldName("key")
                val value = child.getChildByFieldName("value")

                val aliasKey = extractPropertyKey(key, content)
                val aliasValue = extractAliasValue(value, content, configDir)

                if (aliasKey != null && aliasValue != null) {
                    aliases[aliasKey] = aliasValue
                }
            }
        }

        return aliases
    }

    private fun extractAliasValue(valueNode: TSNode, content: String, configDir: File): String? {
        if (valueNode.isNull) {
            return null
        }

        return when (valueNode.type) {
            "string" -> nodeAsString(valueNode, content).trim('"', '\'')
            "call_expression" -> resolvePathCall(valueNode, content, configDir)
            else -> null
        }
    }

    private fun resolvePathCall(callNode: TSNode, content: String, configDir: File): String? {
        val functionNode = callNode.getChildByFieldName("function")
        if (functionNode.isNull) {
            return null
        }

        val functionName = nodeAsString(functionNode, content)
        if (functionName != PATH_RESOLVE) {
            return null
        }

        val arguments = callNode.getChildByFieldName("arguments")
        if (arguments.isNull) {
            return null
        }

        val pathParts = mutableListOf<String>()
        var useConfigDir = false

        for (arg in arguments.getNamedChildren()) {
            when (arg.type) {
                "identifier" -> {
                    val name = nodeAsString(arg, content)
                    if (name == DIRNAME) {
                        useConfigDir = true
                    }
                }
                "string" -> {
                    val value = nodeAsString(arg, content).trim('"', '\'')
                    pathParts.add(value)
                }
            }
        }

        if (pathParts.isEmpty()) {
            return null
        }

        val basePath = if (useConfigDir) configDir else File(".")
        var result = basePath
        for (part in pathParts) {
            result = result.resolve(part)
        }

        return result.canonicalPath
    }
}
