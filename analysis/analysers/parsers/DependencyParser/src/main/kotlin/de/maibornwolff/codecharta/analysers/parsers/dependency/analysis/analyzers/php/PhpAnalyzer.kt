package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpNamespaceQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TreeSitterPhp

class PhpAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val namespaceQueries = PhpNamespaceQueries()

    private lateinit var aliasedTypesExtractor: AliasedTypesExtractor
    private lateinit var dependencyExtractor: DependencyExtractor
    private lateinit var usedTypesExtractor: UsedTypesExtractor
    private lateinit var nodeExtractor: NodeExtractor

    override fun analyze(): FileReport {
        val code = fileInfo.content
        val rootNode = parseCode(code, TreeSitterPhp())

        dependencyExtractor = DependencyExtractor(fileInfo, rootNode)
        val dependencies = dependencyExtractor.extract()

        aliasedTypesExtractor = AliasedTypesExtractor(code, rootNode)
        val aliasedTypes = aliasedTypesExtractor.extract()

        usedTypesExtractor = UsedTypesExtractor(aliasedTypes, dependencies)
        nodeExtractor = NodeExtractor(fileInfo, code)

        return processToFileReport(nodeExtractor.getNodes(rootNode), rootNode)
    }

    private fun processToFileReport(nodes: List<NodeWrapper>, rootNode: TSNode): FileReport {
        val namespaceName = namespaceQueries.getName(rootNode)
        if (namespaceName != null) {
            return FileReport(
                nodes.map {
                    toNodeFromNamespace(
                        it,
                        namespaceName
                    )
                }
            )
        }

        return FileReport(nodes.map { toNodeFromPhysicalPath(it) })
    }

    private fun toNodeFromNamespace(node: NodeWrapper, namespaceName: TSNode): Node {
        val path = extractPathFromNamespace(namespaceName)
        return toNode(node, path)
    }

    private fun toNodeFromPhysicalPath(node: NodeWrapper): Node {
        val path = extractPathFromFileInfo()
        return toNode(node, path)
    }

    private fun toNode(node: NodeWrapper, path: Path): Node {
        val implicitNamespaceImport = Dependency(path = path, isWildcard = true)
        val dependencies = dependencyExtractor.extract()
        return Node(
            pathWithName = path + node.getName(),
            physicalPath = fileInfo.physicalPath,
            language = fileInfo.language,
            nodeType = node.nodeType,
            dependencies = dependencies.map { it.dependency }.toSet() + implicitNamespaceImport,
            usedTypes = usedTypesExtractor.extract(
                node.treesitterNode,
                fileInfo.content
            )
        )
    }

    private fun extractPathFromNamespace(node: TSNode): Path {
        val namespace = nodeAsString(node, fileInfo.content)
        return Path(namespace.split('\\'))
    }

    private fun extractPathFromFileInfo(): Path = fileInfo.physicalPathAsPath()

    private fun parseCode(code: String, language: TSLanguage): TSNode {
        val parser = TSParser()
        parser.language = language
        val tree = parser.parseString(null, code)
        return tree.rootNode
    }
}
