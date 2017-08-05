package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.nodeinserter.NodeInserter
import java.util.stream.Collectors

class LeafNodeMergerStrategy(override val mergeConditionSatisfied: (Node, Node) -> Boolean) : NodeMergerStrategy {
    private val flatNodeMerger = FlatNodeMerger()

    override fun mergeNodeLists(lists: List<List<Node>>?): List<Node> {
        return lists!!.fold(listOf(), { nodes, actual -> reduceNodeList(nodes, actual) })
    }

    private fun reduceNodeList(total: List<Node>, actual: List<Node>): List<Node> {
        return actual.fold(total, {
            t: List<Node>, a: Node ->
            when {
                t.filter { mergeConditionSatisfied(it, a) }.count() > 0 -> t.flatMap { if (mergeConditionSatisfied(it, a)) merge(it, a) else listOf(it) }
                else -> t + a
            }
        })
    }

    private fun merge(vararg nodes: Node): List<Node> {
        val root = flatNodeMerger.merge(*nodes)
        nodes.toList()
                .flatMap { it.pathsToLeaves.collect(Collectors.toList()) }
                .associateBy({ it }, { flatNodeMerger.merge(this, *temp(it, *nodes)) })
                .forEach { NodeInserter.insertByPath(root, it.key, it.value) }
        return listOf(root)
    }

    private fun temp(path: Path<String>, vararg nodes: Node): Array<Node> {
        println("" + path.head() + " " + nodes)
        return nodes.map { n -> n.getNodeBy(path).orElse(null) }.filterNotNull().map { it as Node }.toTypedArray()
    }
}
