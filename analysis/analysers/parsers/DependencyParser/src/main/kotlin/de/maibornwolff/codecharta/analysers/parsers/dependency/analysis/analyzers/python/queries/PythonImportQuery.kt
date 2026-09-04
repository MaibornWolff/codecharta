package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterPython

class PythonImportQuery(val python: TreeSitterPython) {
    private val importQuery = TSQuery(python, "(import_statement (dotted_name) @import)")
    private val importQueryForAlias = TSQuery(python, "(import_statement) @import")
    private val aliasImportIdentifierQuery =
        TSQuery(python, "(import_statement name: (aliased_import alias: (identifier) @identifier))")
    private val aliasImportNameQuery =
        TSQuery(python, "(import_statement name: (aliased_import name: (dotted_name) @name))")

    private val importFromQuery = TSQuery(python, "(import_from_statement) @import_from")
    private val moduleNameQuery = TSQuery(python, "(import_from_statement module_name: (dotted_name) @module_name)")
    private val relativeImportPrefixQuery =
        TSQuery(python, "(import_from_statement module_name: (relative_import (import_prefix) @import_prefix))")
    private val relativeImportModuleNameQuery =
        TSQuery(python, "(import_from_statement module_name: (relative_import (dotted_name) @module_name))")
    private val importedNameQuery = TSQuery(python, "(import_from_statement name: (dotted_name) @name)")
    private val wildcardQuery = TSQuery(python, "(import_from_statement (wildcard_import) @wildcard)")
    private val aliasImportFromIdentifierQuery =
        TSQuery(python, "(import_from_statement name: (aliased_import alias: (identifier) @identifier))")
    private val aliasImportFromNameQuery =
        TSQuery(python, "(import_from_statement name: (aliased_import name: (dotted_name) @name))")

    private val prefixPattern = Regex("^[.]+$")

    fun executeImports(node: TSNode, bodyContainingNode: String) = node.execute(importQuery).map { it.captures[0].node }.map {
        nodeAsString(it, bodyContainingNode)
    }

    fun executeAliasedImports(node: TSNode, bodyContainingNode: String, modulePath: List<String>): Map<String, String> {
        val aliasedImports: MutableMap<String, String> = mutableMapOf()
        val matches = node.execute(importQueryForAlias)

        matches.forEach { match ->
            val capturedNode = match.captures[0].node
            val aliasIdentifiers = extractStringsFromNode(capturedNode, bodyContainingNode, aliasImportIdentifierQuery)
            val aliasNames = extractStringsFromNode(capturedNode, bodyContainingNode, aliasImportNameQuery)
            if (aliasIdentifiers.size == aliasNames.size) {
                aliasIdentifiers.zip(aliasNames).forEach { (identifier, name) ->
                    aliasedImports[identifier] = name
                }
            }
        }
        return aliasedImports
    }

    fun executeImportsFrom(node: TSNode, bodyContainingNode: String, modulePath: List<String>) =
        node.execute(importFromQuery).flatMap { match ->
            val capturedNode = match.captures[0].node
            val moduleName = extractModuleName(bodyContainingNode, capturedNode, modulePath)
            if (moduleName == "") {
                listOf()
            } else {
                val dependencyElements = mutableListOf<String>()
                dependencyElements.addAll(moduleName.split("."))
                val importedNames = extractStringsFromNode(capturedNode, bodyContainingNode, importedNameQuery)
                if (importedNames.isEmpty()) {
                    listOf()
                } else {
                    importedNames.flatMap {
                        listOf(
                            Dependency(Path(dependencyElements + it.split(".")), false),
                            Dependency(Path(dependencyElements + listOf("__init__") + it.split(".")), false)
                        )
                    }
                }
            }
        }

    fun executeWildcardImportsFrom(node: TSNode, bodyContainingNode: String, modulePath: List<String>) =
        node.execute(importFromQuery).flatMap { match ->
            val capturedNode = match.captures[0].node
            val moduleName = extractModuleName(bodyContainingNode, capturedNode, modulePath)
            if (moduleName == "") {
                listOf()
            } else {
                val wildcards = extractStringsFromNode(capturedNode, bodyContainingNode, wildcardQuery)
                if (wildcards.isEmpty()) {
                    listOf()
                } else {
                    listOf(
                        Dependency(Path(moduleName.split(".")), true),
                        Dependency(Path(("$moduleName.__init__").split(".")), true)
                    )
                }
            }
        }

    fun executeAliasedImportsFrom(node: TSNode, bodyContainingNode: String, modulePath: List<String>): Map<String, String> {
        val aliasedImports: MutableMap<String, String> = mutableMapOf()
        val matches = node.execute(importFromQuery)
        matches.forEach { match ->
            val capturedNode = match.captures[0].node
            val moduleName = extractModuleName(bodyContainingNode, capturedNode, modulePath)
            if (moduleName != "") {
                val aliasIdentifiers =
                    extractStringsFromNode(capturedNode, bodyContainingNode, aliasImportFromIdentifierQuery)
                val aliasNames = extractStringsFromNode(capturedNode, bodyContainingNode, aliasImportFromNameQuery)
                if (aliasIdentifiers.size == aliasNames.size) {
                    aliasIdentifiers.zip(aliasNames).forEach { (identifier, name) ->
                        aliasedImports[identifier] = "$moduleName.$name"
                    }
                }
            }
        }
        return aliasedImports
    }

    private fun extractModuleName(bodyContainingNode: String, capturedNode: TSNode, modulePath: List<String>): String {
        val moduleNames = extractStringsFromNode(capturedNode, bodyContainingNode, moduleNameQuery)
        if (moduleNames.size == 1) {
            return moduleNames[0]
        }

        val relativeImportPrefixes = extractStringsFromNode(capturedNode, bodyContainingNode, relativeImportPrefixQuery)
        val relativeImportModuleNames =
            extractStringsFromNode(capturedNode, bodyContainingNode, relativeImportModuleNameQuery)

        if (relativeImportPrefixes.size == 1 && prefixPattern.matches(relativeImportPrefixes[0]) && relativeImportModuleNames.size <= 1) {
            val prefix = relativeImportPrefixes[0]
            val modulePathPrefix = modulePath.dropLast(prefix.length).joinToString(".")

            return if (relativeImportModuleNames.isNotEmpty() && modulePathPrefix.isNotEmpty()) {
                modulePathPrefix + "." + relativeImportModuleNames[0]
            } else {
                modulePathPrefix
            }
        }

        return ""
    }

    private fun extractStringsFromNode(node: TSNode, bodyContainingNode: String, query: TSQuery) = node.execute(query).flatMap {
        it.captures.map { capture ->
            nodeAsString(capture.node, bodyContainingNode)
        }
    }
}
