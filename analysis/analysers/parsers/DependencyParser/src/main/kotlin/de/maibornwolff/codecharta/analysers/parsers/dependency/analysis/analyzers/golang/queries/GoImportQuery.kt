package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterGo

class GoImportQuery(val go: TreeSitterGo) {
    private val importQuery = TSQuery(go, "(import_declaration) @import")
    private val importSpecQuery = TSQuery(go, "(import_spec) @spec")

    fun execute(node: TSNode, bodyContainingNode: String): List<Dependency> {
        val imports = mutableListOf<Dependency>()
        val importDeclarations = node.execute(importQuery)

        for (match in importDeclarations) {
            val importNode = match.captures[0].node
            val specs = importNode.execute(importSpecQuery)

            for (specMatch in specs) {
                val specNode = specMatch.captures[0].node
                val (importPath, isWildcard) = extractImportPathAndWildcard(specNode, bodyContainingNode)
                if (importPath.isNotEmpty()) {
                    val pathComponents = if (importPath.contains("/")) {
                        importPath.split("/").filter { it.isNotEmpty() }
                    } else {
                        listOf(importPath)
                    }
                    imports.add(Dependency(Path(pathComponents), isWildcard, isDotImport = isWildcard))
                }
            }
        }

        return imports
    }

    private fun extractImportPathAndWildcard(specNode: TSNode, bodyContainingNode: String): Pair<String, Boolean> {
        var importPath = ""
        var isWildcard = false

        for (i in 0 until specNode.childCount) {
            val child = specNode.getChild(i)
            when (child.type) {
                "dot" -> isWildcard = true
                "interpreted_string_literal" -> {
                    val path = nodeAsString(child, bodyContainingNode)
                    importPath = path.trim('"')
                }
            }
        }

        return Pair(importPath, isWildcard)
    }
}
