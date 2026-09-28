package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterGo

class GoTypeQuery(val go: TreeSitterGo) {
    private val typeQuery = TSQuery(
        go,
        """
        [
            (type_identifier) @type
            (qualified_type) @type
        ]
        """.trimIndent()
    )

    fun canHandle(declaration: TSNode): Boolean = declaration.type == "type_declaration"

    fun getNodeType(declaration: TSNode): NodeType {
        if (!canHandle(declaration)) {
            return NodeType.UNKNOWN
        }

        val typeSpec = (0 until declaration.childCount)
            .map { declaration.getChild(it) }
            .find { it.type == "type_spec" }
            ?: return NodeType.CLASS

        val typeNode = typeSpec.getChildByFieldName("type")
        return when (typeNode?.type) {
            "struct_type" -> NodeType.CLASS
            "interface_type" -> NodeType.INTERFACE
            else -> NodeType.CLASS
        }
    }

    fun extractName(declaration: TSNode, content: String): String? {
        if (!canHandle(declaration)) {
            return null
        }

        return (0 until declaration.childCount)
            .map { declaration.getChild(it) }
            .find { it.type == "type_spec" }
            ?.getChildByFieldName("name")
            ?.let { nodeAsString(it, content) }
    }

    fun execute(node: TSNode, bodyContainingNode: String): List<Type> = node.execute(typeQuery).map { match ->
        val typeNode = match.captures[0].node
        val typeName = nodeAsString(typeNode, bodyContainingNode)
        Type(typeName, TypeOfUsage.USAGE, emptyList())
    }
}
