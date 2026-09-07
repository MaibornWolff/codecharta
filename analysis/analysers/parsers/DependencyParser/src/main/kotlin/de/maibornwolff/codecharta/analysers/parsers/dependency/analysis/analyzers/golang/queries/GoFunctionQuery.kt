package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterGo

class GoFunctionQuery(val go: TreeSitterGo) {
    private val parameterQuery = TSQuery(go, "(parameter_declaration) @param")
    private val returnTypeQuery = TSQuery(go, "(function_declaration result: (_) @return)")
    private val methodReturnTypeQuery = TSQuery(go, "(method_declaration result: (_) @return)")
    private val callExpressionQuery =
        TSQuery(go, "(call_expression function: (selector_expression operand: (identifier) @object field: (field_identifier) @method))")
    private val functionCallQuery = TSQuery(go, "(call_expression function: (selector_expression field: (field_identifier) @function))")
    private val directFunctionCallQuery = TSQuery(go, "(call_expression function: (identifier) @function)")
    private val qualifiedTypeQuery = TSQuery(go, "(qualified_type package: (package_identifier) @package name: (type_identifier) @type)")

    fun canHandle(declaration: TSNode): Boolean = declaration.type == "function_declaration" || declaration.type == "method_declaration"

    fun getNodeType(declaration: TSNode): NodeType = when (declaration.type) {
        "function_declaration", "method_declaration" -> NodeType.FUNCTION
        else -> NodeType.UNKNOWN
    }

    fun extractName(declaration: TSNode, content: String): String? {
        if (!canHandle(declaration)) return null

        return declaration
            .getChildByFieldName("name")
            ?.takeIf { !it.isNull }
            ?.let { nodeAsString(it, content) }
    }

    fun execute(node: TSNode, bodyContainingNode: String): List<Type> {
        val types = mutableSetOf<Type>()

        val parameters = node.execute(parameterQuery)
        for (match in parameters) {
            val paramNode = match.captures[0].node
            val paramType = extractParameterType(paramNode, bodyContainingNode)
            if (paramType.isNotEmpty()) {
                types.add(Type(paramType, TypeOfUsage.USAGE, emptyList()))
            }
        }

        types.addAll(extractReturnTypes(node, bodyContainingNode))

        types.addAll(extractFunctionBodyTypes(node, bodyContainingNode))

        return types.toList()
    }

    private fun extractParameterType(paramNode: TSNode, bodyContainingNode: String): String {
        for (i in 0 until paramNode.childCount) {
            val child = paramNode.getChild(i)
            when (child.type) {
                "type_identifier" -> return nodeAsString(child, bodyContainingNode)
                "qualified_type" -> {
                    val typeName = child.getChildByFieldName("name")
                    if (typeName != null) {
                        return nodeAsString(typeName, bodyContainingNode)
                    }
                }
                "pointer_type" -> {
                    val underlyingType = child.getNamedChild(0)
                    if (underlyingType?.type == "type_identifier") {
                        return nodeAsString(underlyingType, bodyContainingNode)
                    }
                }
            }
        }
        return ""
    }

    private fun extractReturnTypes(node: TSNode, bodyContainingNode: String): List<Type> {
        val types = mutableListOf<Type>()

        // Try function_declaration result
        val functionReturns = node.execute(returnTypeQuery)
        for (match in functionReturns) {
            val returnNode = match.captures[0].node
            types.addAll(extractTypesFromNode(returnNode, bodyContainingNode))
        }

        // Try method_declaration result
        val methodReturns = node.execute(methodReturnTypeQuery)
        for (match in methodReturns) {
            val returnNode = match.captures[0].node
            types.addAll(extractTypesFromNode(returnNode, bodyContainingNode))
        }

        return types
    }

    private fun extractFunctionBodyTypes(node: TSNode, bodyContainingNode: String): List<Type> {
        val types = mutableListOf<Type>()

        types.addAll(extractFunctionCallTypes(node, bodyContainingNode))
        types.addAll(extractQualifiedTypes(node, bodyContainingNode))

        return types
    }

    private fun extractFunctionCallTypes(node: TSNode, bodyContainingNode: String): List<Type> {
        val types = mutableListOf<Type>()

        types.addAll(extractSelectorBasedFunctionCalls(node, bodyContainingNode))
        types.addAll(extractDirectFunctionCalls(node, bodyContainingNode))

        return types
    }

    private fun extractSelectorBasedFunctionCalls(node: TSNode, bodyContainingNode: String): List<Type> =
        extractFunctionCallsFromQuery(node, bodyContainingNode, functionCallQuery)

    private fun extractDirectFunctionCalls(node: TSNode, bodyContainingNode: String): List<Type> =
        extractFunctionCallsFromQuery(node, bodyContainingNode, directFunctionCallQuery)

    private fun extractFunctionCallsFromQuery(node: TSNode, bodyContainingNode: String, query: TSQuery): List<Type> {
        val types = mutableListOf<Type>()
        val matches = node.execute(query)

        for (match in matches) {
            if (match.captures.isNotEmpty()) {
                val functionNode = match.captures[0].node
                val functionName = nodeAsString(functionNode, bodyContainingNode)

                if (functionName.isNotEmpty()) {
                    types.add(Type(functionName, TypeOfUsage.USAGE, emptyList()))
                }
            }
        }

        return types
    }

    private fun extractQualifiedTypes(node: TSNode, bodyContainingNode: String): List<Type> {
        val types = mutableListOf<Type>()

        val qualifiedTypes = node.execute(qualifiedTypeQuery)
        for (match in qualifiedTypes) {
            if (match.captures.size >= 2) {
                val typeNode = match.captures[1].node
                val typeName = nodeAsString(typeNode, bodyContainingNode)
                types.add(Type(typeName, TypeOfUsage.USAGE, emptyList()))
            }
        }

        return types
    }

    private fun extractTypesFromNode(node: TSNode, bodyContainingNode: String): List<Type> {
        val types = mutableListOf<Type>()

        when (node.type) {
            "type_identifier" -> {
                types.add(Type(nodeAsString(node, bodyContainingNode), TypeOfUsage.USAGE, emptyList()))
            }
            "qualified_type" -> {
                val typeName = node.getChildByFieldName("name")
                if (typeName != null) {
                    types.add(Type(nodeAsString(typeName, bodyContainingNode), TypeOfUsage.USAGE, emptyList()))
                }
            }
            "pointer_type" -> {
                val underlyingType = node.getNamedChild(0)
                if (underlyingType != null) {
                    types.addAll(extractTypesFromNode(underlyingType, bodyContainingNode))
                }
            }
            "parenthesized_type" -> {
                // Handle (Type1, Type2) return types
                for (i in 0 until node.namedChildCount) {
                    val child = node.getNamedChild(i)
                    types.addAll(extractTypesFromNode(child, bodyContainingNode))
                }
            }
        }

        return types
    }
}
