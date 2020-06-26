package de.maibornwolff.codecharta.model

/**
 * merging multiply nodes by using max attribute and link, ignoring children
 */
class NodeMaxAttributeMerger(var mergeChildrenList: Boolean = false) : NodeMergerStrategy {

    override fun merge(tree: MutableNode, otherTrees: List<MutableNode>): MutableNode {
        val nodes = listOf(tree).plus(otherTrees)
        return MutableNode(
                createName(tree),
                createType(nodes),
                createAttributes(nodes),
                createLink(nodes),
                createChildrenList(nodes),
                nodeMergingStrategy = createMergingStrategy(tree)
        )
    }

    private fun createLink(nodes: List<MutableNode>) = nodes.map { it.link }.firstOrNull { it != null && !it.isBlank() }

    private fun createAttributes(nodes: List<MutableNode>) =
            nodes.map { it.attributes }.reduce { acc, mutableMap ->
                acc.mergeReduce(mutableMap) { x, y ->
                    maxValOrFirst(x, y)
                }
            }
                    .toMutableMap()

    private fun createType(nodes: List<MutableNode>): NodeType {
        val types = nodes.mapNotNull { it.type }.distinct()

        return types.firstOrNull { it != NodeType.Folder && it != NodeType.Unknown }
            ?: types.firstOrNull { it != NodeType.Unknown }
            ?: NodeType.Unknown
    }

    private fun createName(nodes: MutableNode) = nodes.name

    private fun createMergingStrategy(tree: MutableNode): NodeMergerStrategy {
        return tree.nodeMergingStrategy
    }

    private fun createChildrenList(nodes: List<MutableNode>): Set<MutableNode> {
        return when {
            mergeChildrenList -> nodes.flatMap { it.children }.toSet()
            else -> setOf()
        }
    }

    private fun maxValOrFirst(x: Any, y: Any): Any {
        return when {
            (x is Long || x is Int || x is Short || x is Byte)
            && (y is Long || y is Int || y is Short || y is Byte) ->
                maxOf((x as Number).toLong(), (y as Number).toLong())
            x is Number && y is Number -> maxOf(x.toDouble(), y.toDouble())
            x !is Number && y is Number -> y
            else -> x
        }
    }

    private fun <K, V> Map<K, V>.mergeReduce(other: Map<K, V>, reduce: (V, V) -> V = { _, b -> b }): Map<K, V> =
            this.toMutableMap().apply { other.forEach { merge(it.key, it.value, reduce) } }
}