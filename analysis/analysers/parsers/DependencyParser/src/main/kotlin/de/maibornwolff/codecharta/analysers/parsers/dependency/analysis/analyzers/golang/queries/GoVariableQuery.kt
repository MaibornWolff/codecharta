package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TreeSitterGo

class GoVariableQuery(val go: TreeSitterGo) {
    private val varQuery = TSQuery(go, "(var_spec) @var")

    fun canHandle(declaration: TSNode): Boolean = declaration.type == "var_declaration" || declaration.type == "const_declaration"

    fun getNodeType(declaration: TSNode): NodeType = if (canHandle(declaration)) NodeType.VARIABLE else NodeType.UNKNOWN

    fun extractName(declaration: TSNode, content: String): String? {
        if (!canHandle(declaration)) {
            return null
        }

        return (0 until declaration.childCount)
            .map { declaration.getChild(it) }
            .find { it.type == "var_spec" || it.type == "const_spec" }
            ?.takeIf { it.childCount > 0 }
            ?.getChild(0)
            ?.takeIf { it.type == "identifier" }
            ?.let { nodeAsString(it, content) }
    }

    fun execute(node: TSNode, bodyContainingNode: String): List<Type> = node.execute(varQuery).mapNotNull { match ->
        val varNode = match.captures[0].node
        extractVariableType(varNode, bodyContainingNode)
    }

    private fun extractVariableType(varNode: TSNode, bodyContainingNode: String): Type? {
        for (i in 0 until varNode.childCount) {
            val child = varNode.getChild(i)
            if (child.type == "type_identifier") {
                val typeName = nodeAsString(child, bodyContainingNode)
                return Type(typeName, TypeOfUsage.USAGE, emptyList())
            }
        }
        return null
    }
}
