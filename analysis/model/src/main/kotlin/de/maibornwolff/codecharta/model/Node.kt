package de.maibornwolff.codecharta.model

import java.util.*
import javax.naming.OperationNotSupportedException

class Node constructor(
        val name: String,
        val type: NodeType? = NodeType.File,
        val attributes: Map<String, Any> = mapOf(),
        val link: String? = "",
        override val children: List<Node> = listOf()
): Tree<Node>() {

    override fun getPathOfChild(child: Tree<Node>): Path {
        if (!children.contains(child)) {
            throw NoSuchElementException("Child $child not contained in MutableNode.")
        }
        return Path(listOf((child.asTreeNode()).name))
    }

    override fun toString(): String {
        return "Node(name='$name', type=$type, attributes=$attributes, link=$link, children=$children)"
    }

    override fun insertAt(path: Path, node: Node) {
        throw OperationNotSupportedException("no inserting in immutable nodes")
    }

    override fun merge(nodes: List<Node>): Node {
        throw OperationNotSupportedException("no inserting in immutable nodes")
    }

    fun toMutableNode(): MutableNode {
        return MutableNode(name, type, attributes, link, children.map { it.toMutableNode() })
    }
}