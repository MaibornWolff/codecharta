package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.getNamedChildren
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpClassQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpConstantsQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpEnumQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpFunctionQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpInterfaceQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.treesitter.TSNode

class NodeExtractor(private val fileInfo: FileInfo, private val code: String) {
    private val classQueries = PhpClassQueries()
    private val functionQueries = PhpFunctionQueries()
    private val interfaceQueries = PhpInterfaceQueries()
    private val enumQueries = PhpEnumQueries()
    private val constantQueries = PhpConstantsQueries()

    fun getNodes(rootNode: TSNode): List<NodeWrapper> {
        val classNodes = extractClasses(rootNode, code)
        val functionNodes = extractStandAloneFunctions(rootNode, code)
        val interfaceNodes = extractInterfaces(rootNode, code)
        val enumNodes = extractEnums(rootNode, code)
        val constantNodes = extractConstantDeclarations(rootNode, code)
        val nodes = classNodes + functionNodes + interfaceNodes + enumNodes + constantNodes

        if (nodes.isEmpty()) {
            val fileNode = NodeWrapper(rootNode, NodeType.SCRIPT) {
                val name = Path(fileInfo.physicalPath.trimFileEnding().split('/', '\\'))
                    .parts
                    .last()
                "$name.script"
            }
            return listOf(fileNode)
        }

        return nodes
    }

    private fun extractClasses(node: TSNode, code: String): List<NodeWrapper> {
        val allClasses = classQueries.getDeclarations(node).map {
            NodeWrapper(it, NodeType.CLASS) {
                val classNames = classQueries.getName(it)
                nodeAsString(classNames.first(), code)
            }
        }
        val traitClasses = classQueries.getTraitTypes(node).map {
            NodeWrapper(it, NodeType.CLASS) { nodeAsString(it, code) }
        }
        return allClasses + traitClasses
    }

    private fun extractStandAloneFunctions(node: TSNode, code: String): List<NodeWrapper> = functionQueries.getDeclarations(node).map {
        NodeWrapper(it, NodeType.FUNCTION) {
            val functionNames = functionQueries.getName(it)
            nodeAsString(functionNames.first(), code)
        }
    }

    private fun extractInterfaces(node: TSNode, code: String): List<NodeWrapper> = interfaceQueries.getDeclarations(node).map {
        NodeWrapper(it, NodeType.INTERFACE) {
            val interfaceNames = interfaceQueries.getName(it)
            nodeAsString(interfaceNames.first(), code)
        }
    }

    private fun extractEnums(node: TSNode, code: String): List<NodeWrapper> = enumQueries.getDeclarations(node).map {
        NodeWrapper(it, NodeType.ENUM) {
            val enumNames = enumQueries.getName(it)
            nodeAsString(enumNames.first(), code)
        }
    }

    private fun extractConstantDeclarations(node: TSNode, code: String): List<NodeWrapper> {
        val withConstKeyWord = constantQueries.getDeclarations(node).map {
            NodeWrapper(it, NodeType.VARIABLE) { nodeAsString(it, code) }
        }

        val withDefineKeyWord =
            constantQueries
                .getDefineDeclaration(node)
                .chunked(2)
                .filter { nodeAsString(it[0], code) == "define" }
                .mapNotNull { argumentsNode ->
                    argumentsNode[1]
                        .getNamedChildren()
                        .firstOrNull { it.type == "argument" }
                        ?.let { constNode ->
                            val constantName = nodeAsString(constNode, code).trim('\'', '"')
                            NodeWrapper(constNode, NodeType.VARIABLE) {
                                constantName
                            }
                        }
                }

        return withConstKeyWord + withDefineKeyWord
    }
}
