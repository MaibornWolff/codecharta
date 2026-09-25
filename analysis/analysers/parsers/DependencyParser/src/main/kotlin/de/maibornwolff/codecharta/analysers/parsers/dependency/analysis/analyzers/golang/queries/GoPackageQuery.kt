package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterGo

class GoPackageQuery(val go: TreeSitterGo) {
    private val packageQuery = TSQuery(go, "(package_clause) @package")
    private val identifierQuery = TSQuery(go, "(package_identifier) @identifier")

    fun execute(node: TSNode, content: String): List<String> {
        val results = node.execute(packageQuery)
        return results.mapNotNull { match ->
            val packageNode = match.captures[0].node
            extractPackageName(packageNode, content)
        }
    }

    fun derivePackagePathFromFilePath(filePath: String, packageName: List<String>): List<String> {
        val directoryPath = extractDirectoryPartsFromFilePath(filePath)

        return when {
            packageName.isEmpty() -> {
                directoryPath.ifEmpty { listOf("unknown") } // Go files must have a package declaration
            }
            packageName[0] == "main" -> {
                // Main packages need directory context to be unique across executables
                // Multiple main packages in cmd/server/, cmd/cli/, etc. must not collide
                directoryPath.ifEmpty { listOf("main") }
            }
            else -> {
                // Regular packages use directory structure to match Go's import paths
                // This ensures the visualization aligns with how developers import packages
                directoryPath.ifEmpty { packageName }
            }
        }
    }

    private fun extractDirectoryPartsFromFilePath(filePath: String): List<String> {
        val cleanPath = filePath.replace("\\", "/").trimStart('.', '/')
        val pathParts = cleanPath.split("/").filter { it.isNotEmpty() }

        return if (pathParts.isNotEmpty() && pathParts.last().contains(".")) {
            pathParts.dropLast(1)
        } else {
            pathParts
        }
    }

    private fun extractPackageName(packageNode: TSNode, content: String): String? {
        val identifierMatches = packageNode.execute(identifierQuery)
        return identifierMatches.firstOrNull()?.let { match ->
            nodeAsString(match.captures[0].node, content)
        }
    }
}
