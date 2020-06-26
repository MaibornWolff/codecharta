package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.translator.MetricNameTranslator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.NoSuchElementException

class MutableNode(
    val name: String,
    val type: NodeType? = NodeType.File,
    var attributes: Map<String, Any> = mapOf(),
    val link: String? = "",
    childrenList: Set<MutableNode> = setOf(),
    @Transient val nodeMergingStrategy: NodeMergerStrategy = NodeMaxAttributeMerger()
) : Tree<MutableNode>() {

    override var children = childrenList.toMutableSet()

    override fun getPathOfChild(child: Tree<MutableNode>): Path {
        if (!children.contains(child))
            throw NoSuchElementException("Child $child not contained in MutableNode.")
        return Path(listOf((child.asTreeNode()).name))
    }

    override fun toString(): String {
        return "MutableNode(name='$name', type=$type, attributes=$attributes, link=$link, children=$children)"
    }

    override fun insertAt(path: Path, node: MutableNode) {
        NodeInserter.insertByPath(this, path, node)
    }

    override fun merge(nodes: List<MutableNode>): MutableNode {
        return nodeMergingStrategy.merge(this, nodes)
    }

    fun translateMetrics(metricNameTranslator: MetricNameTranslator, recursive: Boolean = false): MutableNode {
        if (recursive) {
            runBlocking(Dispatchers.Default) {
                children.forEach {
                    launch { it.translateMetrics(metricNameTranslator, recursive) }
                }
            }
        }
        attributes = attributes.mapKeys { metricNameTranslator.translate(it.key) }.filterKeys { it.isNotBlank() }

        return this
    }

    fun toNode(): Node {
        return Node(name, type, attributes, link, children = children.map { it.toNode() }.toSet())
    }

    val isEmptyFolder
        get() = type == NodeType.Folder && children.isEmpty()

    fun filterChildren(filterRule: (MutableNode) -> Boolean, recursive: Boolean = false): MutableNode? {
        children.removeAll { !filterRule(it) }
        if (recursive) {
            children.forEach { it.filterChildren(filterRule, recursive) }
        }
        children.removeAll { !filterRule(it) }

        return when {
            children.isEmpty() && type == NodeType.Folder -> null
            else -> this
        }
    }
}