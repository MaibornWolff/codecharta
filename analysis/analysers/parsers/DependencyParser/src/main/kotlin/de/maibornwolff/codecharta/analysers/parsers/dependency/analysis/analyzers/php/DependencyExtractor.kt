package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.toImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.resolveRelativePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpNamespaceQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.treesitter.TSNode

class DependencyExtractor(val fileInfo: FileInfo, private val rootNode: TSNode) {
    private var namespaceQueries = PhpNamespaceQueries()
    private var dependencies: Set<DependencyWrapper> = emptySet()

    fun extract(): Set<DependencyWrapper> {
        if (dependencies.isNotEmpty()) return dependencies

        dependencies = computeDependencies()
        return dependencies
    }

    private fun computeDependencies(): Set<DependencyWrapper> {
        val fromUsages = namespaceQueries.getUsages(rootNode)
        val singleUsages = pathFromSingleUsages(fromUsages)
        val groupedUsages = pathFromGroupedUsages(fromUsages)
        val aliasUsages = pathFromAliasUsages(rootNode)
        val requireUsages = pathFromImportStatements(rootNode)

        val singleUsagesWithoutConstants =
            singleUsages.filter { !it.parts.any { part -> part.trim().contains("const") } }
        val singleUsagesWithConstants = singleUsages
            .filter { it.parts.any { part -> part.trim().contains("const") } }
            .map {
                val first = listOf(it.parts.first())
                val rest = it.parts.drop(1)
                val path = Path(
                    first.find { part -> part.contains("const") }?.let {
                        listOf(it.replace("const ", "")) + rest
                    } ?: it.parts
                )

                DependencyWrapper(Dependency(path), true)
            }

        val allDependencies =
            (singleUsages + groupedUsages + aliasUsages + requireUsages + singleUsagesWithoutConstants)
                .map { DependencyWrapper(Dependency(it)) }
        return (allDependencies + singleUsagesWithConstants).toSet()
    }

    private fun pathFromSingleUsages(fromUsages: List<TSNode>): List<Path> {
        val singleUsages = fromUsages.flatMap {
            namespaceQueries.getSingleUsages(it)
        }
        return singleUsages.map { extractPathFromNamespace(it) }
    }

    // The query captures every grouped use as a (namespace, group) pair of nodes, in file order.
    private fun pathFromGroupedUsages(fromUsages: List<TSNode>): List<Path> = fromUsages
        .flatMap { namespaceQueries.getGroupedUsages(it) }
        .chunked(GROUPED_USAGE_CAPTURES)
        .filter { it.size == GROUPED_USAGE_CAPTURES }
        .flatMap { (namespaceNode, groupNode) ->
            val prefix = extractPathFromNamespace(namespaceNode)
            nodeAsString(groupNode, fileInfo.content)
                .trim('{', '}')
                .split(",")
                .map { prefix + it.trim() }
        }

    private fun pathFromAliasUsages(node: TSNode): List<Path> {
        val aliasUsages = namespaceQueries.getAliasUsage(node)
        if (aliasUsages.isEmpty()) {
            return emptyList()
        }
        val aliasPath = aliasUsages
            .map { nodeAsString(it, fileInfo.content) }
            .map { it.split("\\").map { it.trim() } }
            .map { Path(it) }

        return aliasPath
            .map { Dependency(it) }
            .map { it.path }
    }

    private fun pathFromImportStatements(rootNode: TSNode): List<Path> {
        val requireOnceNodes = namespaceQueries.getImportUsages(rootNode)
        val namespaceName = namespaceQueries.getName(rootNode)

        val pathOfAnalyzedFile =
            if (namespaceName == null) {
                Path(fileInfo.physicalPath.trimFileEnding().split("/", "\\"))
            } else {
                val namespacePath = extractPathFromNamespace(namespaceName).parts.map { it.trim(';') }
                Path(
                    namespacePath + fileInfo.physicalPath
                        .trimFileEnding()
                        .split("/", "\\")
                        .last()
                )
            }

        val requirePaths = requireOnceNodes.map {
            nodeAsString(it, fileInfo.content)
                .replace("\\", "/")
                .trim('"', '\'')
                .trimFileEnding()
        }

        val imports = requirePaths.map { it.toImport() }
        return imports.map {
            resolveRelativePath(
                it,
                pathOfAnalyzedFile
            )
        }
    }

    private fun extractPathFromNamespace(node: TSNode): Path {
        val namespace = nodeAsString(node, fileInfo.content)
        return Path(namespace.split('\\'))
    }

    companion object {
        private const val GROUPED_USAGE_CAPTURES = 2
    }
}
