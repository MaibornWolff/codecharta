package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries.PythonDefinitionsQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries.PythonImportQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries.PythonTypeAttributeQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.queries.PythonTypeIdentifierQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser
import org.treesitter.TreeSitterPython

class PythonAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val python = TreeSitterPython()
    private val definitionsQuery = PythonDefinitionsQuery(python)
    private val importQuery = PythonImportQuery(python)
    private val identifierQuery = PythonTypeIdentifierQuery(python)
    private val attributeQuery = PythonTypeAttributeQuery(python)

    override fun analyze(): FileReport {
        val rootNode = parseCode(fileInfo.content)
        val filePathWithSlashes = fileInfo.physicalPathAsPath()
        val pathWithoutFileEnding = filePathWithSlashes.withoutFileSuffix("py")
        val modulePath = pathWithoutFileEnding.parts

        val definitions = definitionsQuery.execute(rootNode)

        val importsFrom = importQuery.executeImportsFrom(rootNode, fileInfo.content, modulePath)
        val wildcardImportsFrom = importQuery.executeWildcardImportsFrom(rootNode, fileInfo.content, modulePath)
        val aliasedImportsFrom = importQuery.executeAliasedImportsFrom(rootNode, fileInfo.content, modulePath)

        val imports = importQuery.executeImports(rootNode, fileInfo.content)
        val aliasedImports = importQuery.executeAliasedImports(rootNode, fileInfo.content, modulePath)

        val nodes = mutableListOf<Node>()

        if (modulePath.last() == "__init__") {
            nodes.addAll(
                importsFrom.filter { dependency -> "__init__" !in dependency.path.parts }.map { dependency ->
                    Node(
                        pathWithName = Path(modulePath + dependency.path.parts.last()),
                        physicalPath = fileInfo.physicalPath,
                        language = SupportedLanguage.PYTHON,
                        nodeType = NodeType.UNKNOWN,
                        dependencies = importsFrom.toSet(),
                        usedTypes = setOf(Type.simple(dependency.path.parts.last()))
                    )
                }
            )
        }

        if (definitions.isNotEmpty()) {
            nodes.addAll(
                definitions.map {
                    extractNodeFromDefinition(
                        modulePath,
                        it,
                        importsFrom + wildcardImportsFrom,
                        aliasedImportsFrom,
                        imports,
                        aliasedImports
                    )
                }
            )
        }

        return FileReport(nodes)
    }

    private fun parseCode(pythonCode: String): TSNode {
        val parser = TSParser()
        parser.language = python
        val tree = parser.parseString(null, pythonCode)
        return tree.rootNode
    }

    private fun extractNodeFromDefinition(
        modulePath: List<String>,
        definition: TSNode,
        importFromDependencies: List<Dependency>,
        aliasedImportsFrom: Map<String, String>,
        imports: List<String>,
        aliasedImports: Map<String, String>
    ): Node {
        val mutableImportFromDependencies = importFromDependencies.toMutableList()
        val nodeBody = nodeAsString(definition, fileInfo.content)
        val definitionNode = parseCode(nodeBody).getChild(0)

        if (definition.type == "identifier") {
            return Node(
                pathWithName = Path(modulePath + nodeBody),
                physicalPath = fileInfo.physicalPath,
                language = SupportedLanguage.PYTHON,
                nodeType = NodeType.VARIABLE,
                dependencies = setOf(),
                usedTypes = setOf()
            )
        }

        var classOrFunctionDefinitionNode = definitionNode
        if (definition.type == "decorated_definition") {
            classOrFunctionDefinitionNode = definitionNode.getChildByFieldName("definition")
        }

        val definitionName = nodeAsString(classOrFunctionDefinitionNode.getChildByFieldName("name"), nodeBody)

        val importFromTypes = buildImportFromTypes(
            identifierQuery.execute(definitionNode, nodeBody),
            aliasedImportsFrom,
            mutableImportFromDependencies
        )

        val importDependencies = buildImportDependencies(imports, aliasedImports, definitionNode, nodeBody)

        return Node(
            pathWithName = Path(modulePath + definitionName),
            physicalPath = fileInfo.physicalPath,
            language = SupportedLanguage.PYTHON,
            nodeType = nodeType(classOrFunctionDefinitionNode),
            dependencies = mutableImportFromDependencies.toSet() + importDependencies,
            usedTypes = importFromTypes
        )
    }

    private fun nodeType(declaration: TSNode) = when (declaration.type) {
        "class_definition" -> NodeType.CLASS
        "function_definition" -> NodeType.FUNCTION
        else -> NodeType.UNKNOWN
    }

    private fun buildImportFromTypes(
        types: List<String>,
        aliasedImportsFrom: Map<String, String>,
        mutableDependencies: MutableList<Dependency>
    ): Set<Type> = types
        .map {
            val aliasedType = checkAliasImportFrom(it, aliasedImportsFrom, mutableDependencies)
            Type.simple(aliasedType)
        }.toSet()

    private fun checkAliasImportFrom(
        type: String,
        aliasedImportsFrom: Map<String, String>,
        mutableDependencies: MutableList<Dependency>
    ): String {
        val aliasedImport = aliasedImportsFrom[type]?.split(".") ?: return type
        val aliasedType = aliasedImport.last()
        mutableDependencies.add(Dependency(Path(aliasedImport)))
        mutableDependencies.add(Dependency(Path(aliasedImport.dropLast(1) + listOf("__init__", aliasedType))))
        return aliasedType
    }

    private fun buildImportDependencies(
        imports: List<String>,
        aliasedImports: Map<String, String>,
        definitionNode: TSNode,
        nodeBody: String
    ): Set<Dependency> {
        if (imports.isEmpty() && aliasedImports.isEmpty()) return emptySet()
        return attributeQuery
            .execute(definitionNode, nodeBody)
            .flatMap { attribute -> attributeDependencies(attribute, imports, aliasedImports) }
            .toSet()
    }

    private fun attributeDependencies(attribute: String, imports: List<String>, aliasedImports: Map<String, String>): List<Dependency> {
        val attributeSegments = attribute.split(".")
        if (attributeSegments.size < 2) return emptyList()
        val attributeType = attributeSegments.last()
        val identifierSegments = attributeSegments.dropLast(1)
        val attributeIdentifier = identifierSegments.joinToString(".")
        val importedSegments = if (attributeIdentifier in imports) {
            identifierSegments
        } else {
            aliasedImports[attributeIdentifier]?.split(".") ?: return emptyList()
        }
        return listOf(
            Dependency(Path(importedSegments + listOf(attributeType)), false),
            Dependency(Path(importedSegments + listOf("__init__", attributeType)), false)
        )
    }
}
