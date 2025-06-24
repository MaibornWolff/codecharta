package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.PythonQueries
import org.treesitter.TSNode
import org.treesitter.TSTreeCursor
import org.treesitter.TreeSitterPython

class PythonCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPython(),
    queryProvider = PythonQueries()
) {
    override fun getRealLinesOfCode(root: TSNode): Int {
        if (root.childCount == 0) return 0

        rootNodeType = root.type
        val commentTypes = getParentAndChildNodeTypesFromQuery(queryProvider.commentLinesQuery)
        return walkTree(TSTreeCursor(root), commentTypes)
    }

    private fun walkTree(cursor: TSTreeCursor, commentTypes: List<Pair<String, String?>>): Int {
        var realLinesOfCode = 0
        val currentNode = cursor.currentNode()

        if (!isCommentNode(currentNode, commentTypes)) {
            if (currentNode.startPoint.row > lastCountedLine &&
                currentNode.type != rootNodeType &&
                !areAllChildrenInLineCommentNodes(currentNode, currentNode.startPoint.row, commentTypes)
            ) {
                lastCountedLine = currentNode.startPoint.row
                realLinesOfCode++
            }

            if (currentNode.childCount == 0) {
                if (currentNode.endPoint.row > lastCountedLine) {
                    realLinesOfCode += currentNode.endPoint.row - currentNode.startPoint.row
                    lastCountedLine = currentNode.endPoint.row
                }
            } else if (currentNode.endPoint.row > currentNode.startPoint.row && cursor.gotoFirstChild()) {
                realLinesOfCode += walkTree(cursor, commentTypes)
            }
        }

        if (cursor.gotoNextSibling()) {
            realLinesOfCode += walkTree(cursor, commentTypes)
        } else {
            cursor.gotoParent()
        }

        return realLinesOfCode
    }

    private fun getParentAndChildNodeTypesFromQuery(query: String): List<Pair<String, String?>> {
        val regex = Regex("""\((.*?)\)\s*@""", RegexOption.MULTILINE)
        val commentNodeTypes = regex.findAll(query).map { it.groupValues[1] }.toList()

        val parentToChildTypes = commentNodeTypes.mapNotNull {
            val match = Regex("""(\w+)(?:\s*\((\w+)\))?""").find(it)
            match?.let { m -> m.groupValues[1] to m.groupValues.getOrNull(2) }
        }
        return parentToChildTypes
    }

    private fun isCommentNode(node: TSNode, commentTypes: List<Pair<String, String?>>): Boolean {
        for ((parentType, childType) in commentTypes) {
            if (childType.isNullOrBlank() && node.type == parentType) {
                return true
            } else if (node.type == parentType && node.childCount == 1 && node.getChild(0).type == childType) {
                return true
            }
        }
        return false
    }

    private fun areAllChildrenInLineCommentNodes(node: TSNode, line: Int, commentTypes: List<Pair<String, String?>>): Boolean {
        val lookAheadCursor = TSTreeCursor(node)
        if (lookAheadCursor.gotoFirstChild()) {
            do {
                val currentNode = lookAheadCursor.currentNode()
                require(
                    currentNode.startPoint.row >= line
                ) { "Malformed tree detected, child node start line comes before parent node start like!" }
                if (currentNode.startPoint.row > line) return true
                if (!isCommentNode(currentNode, commentTypes)) return false
            } while (lookAheadCursor.gotoNextSibling())
        }
        return true
    }
}
