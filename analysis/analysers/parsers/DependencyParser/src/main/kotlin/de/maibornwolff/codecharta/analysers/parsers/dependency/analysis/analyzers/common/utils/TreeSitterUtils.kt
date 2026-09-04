package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils

import org.treesitter.TSNode
import org.treesitter.TSQuery
import org.treesitter.TSQueryCursor
import org.treesitter.TSQueryMatch

fun <T> TSQueryCursor.TSMatchIterator.map(transform: (TSQueryMatch) -> T): List<T> {
    val result = mutableListOf<T>()
    forEach {
        result.add(transform(it))
    }
    return result
}

fun TSNode.getNamedChildren(): List<TSNode> {
    val namedChildren = mutableListOf<TSNode>()
    for (i in 0..<namedChildCount) {
        namedChildren.add(getNamedChild(i))
    }
    return namedChildren
}

fun TSNode.getChildren(): List<TSNode> {
    val children = mutableListOf<TSNode>()
    for (i in 0..<childCount) {
        children.add(getChild(i))
    }
    return children
}

fun TSNode.execute(query: TSQuery): List<TSQueryMatch> {
    val cursor = TSQueryCursor()
    cursor.exec(query, this)
    return cursor.matches.map { it }
}

fun TSNode.find(type: String): TSNode? = getNamedChildren().find { it.type == type }

/**
 * @param node the node to turn into a string, which references the content of the bodyContainingNode
 * @param bodyContainingNode the part of the original file, which the current TreeSitter was executed against
 */
fun nodeAsString(node: TSNode, bodyContainingNode: String): String {
    val bytes = bodyContainingNode.toByteArray().sliceArray(node.startByte..<node.endByte)
    return String(bytes)
}
