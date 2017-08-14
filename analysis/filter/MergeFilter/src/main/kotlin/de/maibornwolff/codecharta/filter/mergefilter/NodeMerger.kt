package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node

class NodeMerger {
    /**
     * merge nodes, ignoring children
     */
    fun merge(vararg nodes: Node): Node {
        return Node(
                createName(nodes),
                createType(nodes),
                createAttributes(nodes),
                createLink(nodes))
    }

    private fun createLink(nodes: Array<out Node>) = nodes.map { it.link }.filter { it != null && !it.isBlank() }.firstOrNull()

    private fun createAttributes(nodes: Array<out Node>) = nodes.map { it.attributes }.filterNotNull().reduce { acc, mutableMap -> acc.plus(mutableMap) }.orEmpty()

    private fun createType(nodes: Array<out Node>) = nodes.map { it.type }.first()

    private fun createName(nodes: Array<out Node>) = nodes.map { it.name }.first()

    /**
     * merge nodes using mergerStrategy for children
     */
    fun merge(mergerStrategy: NodeMergerStrategy, vararg nodes: Node): Node {
        val node = merge(*nodes)
        node.children.addAll(mergerStrategy.mergeNodeLists(nodes.map { it.children }))
        return node
    }

}
