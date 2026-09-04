package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries.GoDeclarationsQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries.GoFunctionQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries.GoImportQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries.GoPackageQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries.GoTypeQuery
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries.GoVariableQuery
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
import org.treesitter.TreeSitterGo

class GoAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val golang = TreeSitterGo()
    private val packageQuery = GoPackageQuery(golang)
    private val importQuery = GoImportQuery(golang)
    private val declarationsQuery = GoDeclarationsQuery(golang)
    private val typeQuery = GoTypeQuery(golang)
    private val functionQuery = GoFunctionQuery(golang)
    private val variableQuery = GoVariableQuery(golang)

    override fun analyze(): FileReport = analyzeWithTransitiveDependencies(false)

    fun analyzeWithTransitiveDependencies(resolveTransitive: Boolean = true): FileReport {
        val rootNode = parseCode(fileInfo.content)
        val packageResult = packageQuery.execute(rootNode, fileInfo.content)
        val packagePath = packageQuery.derivePackagePathFromFilePath(fileInfo.physicalPath, packageResult)

        val selfDependency = Dependency(Path(packageResult))
        val dependencies = importQuery.execute(rootNode, fileInfo.content) + listOf(selfDependency)
        val declarations = declarationsQuery.execute(rootNode)

        val (methodDeclarations, otherDeclarations) = declarations.partition {
            it.type == "method_declaration"
        }

        val nodes = otherDeclarations
            .map { declaration ->
                extractNodeFromDeclaration(packagePath, dependencies, declaration)
            }.toMutableList()

        aggregateMethodsIntoReceiverTypes(nodes, methodDeclarations)

        return if (resolveTransitive) {
            FileReport(resolveTransitiveDependencies(nodes))
        } else {
            FileReport(nodes)
        }
    }

    private fun extractNodeFromDeclaration(packagePath: List<String>, imports: List<Dependency>, declaration: TSNode): Node {
        val declarationName = extractDeclarationName(declaration, fileInfo.content)
        val nodeType = determineNodeType(declaration)
        val usedTypes = extractUsedTypes(declaration, fileInfo.content)

        return Node(
            pathWithName = Path(packagePath + declarationName),
            physicalPath = fileInfo.physicalPath,
            language = SupportedLanguage.GO,
            nodeType = nodeType,
            dependencies = imports.toSet(),
            usedTypes = usedTypes
        )
    }

    private fun extractDeclarationName(declaration: TSNode, content: String): String {
        functionQuery.extractName(declaration, content)?.let { return it }
        typeQuery.extractName(declaration, content)?.let { return it }
        variableQuery.extractName(declaration, content)?.let { return it }

        if (!declaration.isNull) {
            val nameNode = declaration.getChildByFieldName("name")
            if (nameNode != null && !nameNode.isNull) {
                return nodeAsString(nameNode, content)
            }
        }

        return "unknown"
    }

    private fun determineNodeType(declaration: TSNode): NodeType = when {
        functionQuery.canHandle(declaration) -> functionQuery.getNodeType(declaration)
        typeQuery.canHandle(declaration) -> typeQuery.getNodeType(declaration)
        variableQuery.canHandle(declaration) -> variableQuery.getNodeType(declaration)
        else -> NodeType.UNKNOWN
    }

    private fun extractUsedTypes(declaration: TSNode, content: String): Set<Type> {
        val types = mutableSetOf<Type>()

        if (functionQuery.canHandle(declaration)) {
            types.addAll(functionQuery.execute(declaration, content))
        }

        types.addAll(typeQuery.execute(declaration, content))

        return types
    }

    private fun parseCode(goCode: String): TSNode {
        val parser = TSParser()
        parser.language = golang
        val tree = parser.parseString(null, goCode)
        return tree.rootNode
    }

    private fun aggregateMethodsIntoReceiverTypes(nodes: MutableList<Node>, methodDeclarations: List<TSNode>) {
        methodDeclarations.forEach { methodDecl ->
            val receiverTypeName = extractReceiverTypeName(methodDecl)
            if (receiverTypeName != null) {
                val receiverTypeNode = findReceiverTypeNode(nodes, receiverTypeName)
                if (receiverTypeNode != null) {
                    mergeMethodUsedTypesIntoReceiverType(nodes, receiverTypeNode, methodDecl)
                }
            }
        }
    }

    private fun findReceiverTypeNode(nodes: List<Node>, receiverTypeName: String): Node? = nodes.find { node ->
        node.pathWithName.parts.last() == receiverTypeName
    }

    private fun mergeMethodUsedTypesIntoReceiverType(nodes: MutableList<Node>, receiverTypeNode: Node, methodDeclaration: TSNode) {
        val methodUsedTypes = extractUsedTypes(methodDeclaration, fileInfo.content)
        val nodeWithMergedUsedTypes = receiverTypeNode.copy(
            usedTypes = receiverTypeNode.usedTypes + methodUsedTypes
        )
        replaceNodeInList(nodes, receiverTypeNode, nodeWithMergedUsedTypes)
    }

    private fun replaceNodeInList(nodes: MutableList<Node>, oldNode: Node, newNode: Node) {
        val nodeIndex = nodes.indexOf(oldNode)
        nodes[nodeIndex] = newNode
    }

    private fun extractReceiverTypeName(methodDecl: TSNode): String? {
        val receiverNode = methodDecl.getChildByFieldName("receiver")
        if (receiverNode == null || receiverNode.isNull) {
            return null
        }

        return findParameterDeclarationInReceiver(receiverNode)
    }

    private fun findParameterDeclarationInReceiver(receiverNode: TSNode): String? {
        for (i in 0 until receiverNode.childCount) {
            val child = receiverNode.getChild(i)
            if (child.type == "parameter_declaration") {
                return extractTypeFromParameterDeclaration(child)
            }
        }
        return null
    }

    private fun extractTypeFromParameterDeclaration(parameterDeclaration: TSNode): String? {
        for (j in 0 until parameterDeclaration.childCount) {
            val paramChild = parameterDeclaration.getChild(j)
            when (paramChild.type) {
                "type_identifier" -> return nodeAsString(paramChild, fileInfo.content)
                "pointer_type" -> return extractUnderlyingTypeFromPointer(paramChild)
            }
        }
        return null
    }

    private fun extractUnderlyingTypeFromPointer(pointerType: TSNode): String? {
        val underlyingType = pointerType.getNamedChild(0)
        if (underlyingType?.type == "type_identifier") {
            return nodeAsString(underlyingType, fileInfo.content)
        }
        return null
    }

    private fun resolveTransitiveDependencies(nodes: List<Node>): List<Node> {
        val callGraph = buildCallGraph(nodes)
        val publicNodes = filterPublicNodes(nodes)
        val privateNodeNames = extractPrivateNodeNames(nodes)

        return publicNodes.map { node ->
            val nodeName = node.pathWithName.parts.last()
            val transitivePublicDeps = computeTransitivePublicDependencies(
                nodeName,
                callGraph,
                privateNodeNames
            )

            node.copy(
                usedTypes = transitivePublicDeps.map { Type.simple(it) }.toSet()
            )
        }
    }

    private fun buildCallGraph(nodes: List<Node>): Map<String, MutableSet<String>> {
        val callGraph = mutableMapOf<String, MutableSet<String>>()
        nodes.forEach { node ->
            val nodeName = node.pathWithName.parts.last()
            callGraph[nodeName] = node.usedTypes.map { it.name }.toMutableSet()
        }
        return callGraph
    }

    private fun filterPublicNodes(nodes: List<Node>): List<Node> = nodes.filter { node ->
        val name = node.pathWithName.parts.last()
        name.isNotEmpty() && name[0].isUpperCase()
    }

    private fun extractPrivateNodeNames(nodes: List<Node>): Set<String> = nodes
        .filter { node ->
            val name = node.pathWithName.parts.last()
            name.isNotEmpty() && name[0].isLowerCase()
        }.map { it.pathWithName.parts.last() }
        .toSet()

    private fun computeTransitivePublicDependencies(
        startNode: String,
        callGraph: Map<String, Set<String>>,
        privateNodeNames: Set<String>
    ): Set<String> {
        val visited = mutableSetOf<String>()
        val publicDependencies = mutableSetOf<String>()
        val stack = ArrayDeque<String>()
        stack.add(startNode)

        while (stack.isNotEmpty()) {
            val current = stack.removeLast()
            if (current in visited) continue

            visited.add(current)

            val dependencies = callGraph[current] ?: emptySet()
            for (dep in dependencies) {
                if (dep !in privateNodeNames && dep != current) {
                    publicDependencies.add(dep)
                } else if (dep in privateNodeNames && dep !in visited) {
                    stack.add(dep)
                }
            }
        }

        return publicDependencies
    }
}
