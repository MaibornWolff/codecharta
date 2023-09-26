package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.translator.MetricNameTranslator

open class ProjectBuilder(
    private val nodes: List<MutableNode> = listOf(MutableNode("root", NodeType.Folder)),
    private var edges: MutableList<Edge> = mutableListOf(),
    private var attributeTypes: MutableMap<String, MutableMap<String, AttributeType>> = mutableMapOf(),
    private var attributeDescriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf(),
    private var blacklist: MutableList<BlacklistItem> = mutableListOf()
    ) {

    val DUMMY_PROJECT_NAME = ""

    init {
        if (nodes.size != 1) throw IllegalStateException("No unique root node was found, instead ${nodes.size} candidates identified.")
    }

    val rootNode: MutableNode
        get() = nodes[0]

    val size: Int
        get() = rootNode.size

    fun insertByPath(position: Path, node: MutableNode): ProjectBuilder {
        rootNode.insertAt(position, node)
        return this
    }

    fun insertEdge(thisEdge: Edge): ProjectBuilder {
        edges.add(thisEdge)
        return this
    }

    private var metricNameTranslator: MetricNameTranslator = MetricNameTranslator.TRIVIAL

    private var filterRule: (MutableNode) -> Boolean = { true }

    fun withMetricTranslator(metricNameTranslator: MetricNameTranslator): ProjectBuilder {
        this.metricNameTranslator = metricNameTranslator
        return this
    }

    fun withFilter(filterRule: (MutableNode) -> Boolean = { true }): ProjectBuilder {
        this.filterRule = filterRule
        return this
    }

    open fun build(): Project {
        return build(false)
    }

    open fun build(cleanAttributeDescriptors: Boolean = false): Project {
        nodes.flatMap { it.nodes.values }
            .mapNotNull { it.filterChildren(filterRule, false) }
            .map { it.translateMetrics(metricNameTranslator, false) }

        edges.forEach { it.translateMetrics(metricNameTranslator) }

        filterEmptyFolders()
        if (cleanAttributeDescriptors) { removeUnusedAttributeDescriptors() }
        val project = Project(
            DUMMY_PROJECT_NAME,
            nodes.map { it.toNode() }.toList(),
            edges = edges.toList(),
            attributeTypes = attributeTypes.toMap(),
            attributeDescriptors = attributeDescriptors.toMap(),
            blacklist = blacklist.toList()
        )

        System.err.println()
        System.err.println("Created Project with ${project.size} leaves.")

        return project
    }

    private fun filterEmptyFolders() {
        nodes.forEach { it.filterChildren({ !it.isEmptyFolder }, true) }
    }

    fun addAttributeTypes(attributeTypesToAdd: AttributeTypes): ProjectBuilder {
        if (!attributeTypes.containsKey(attributeTypesToAdd.type)) {
            attributeTypes[attributeTypesToAdd.type] = attributeTypesToAdd.attributeTypes.toMutableMap()
        } else {
            attributeTypes.getValue(attributeTypesToAdd.type).plus(attributeTypesToAdd.attributeTypes)
        }
        return this
    }

    fun addAttributeDescriptions(descriptions: Map<String, AttributeDescriptor>): ProjectBuilder {
        attributeDescriptors.putAll(descriptions)
        return this
    }

    private fun removeUnusedAttributeDescriptors() {
        val attributeSet = this.attributeDescriptors.keys.toMutableSet()
        val nodesToWalk: MutableList<Node> = mutableListOf(this.rootNode.toNode())

        var i = 0
        while (i < nodesToWalk.size) {
            val currentNode = nodesToWalk[i]
            nodesToWalk.addAll(currentNode.children)
            if (currentNode.type != NodeType.Folder) {
                attributeSet.removeAll(currentNode.attributes.keys)
                if (attributeSet.isEmpty()) {
                    return
                }
            }
            i++
        }
        edges.forEach { edge ->
            attributeSet.removeAll(edge.attributes.keys)
            if (attributeSet.isEmpty()) { return }
        }

        val attributeDescriptors = this.attributeDescriptors.toMutableMap()
        attributeSet.forEach { attributeDescriptors.remove(it) }
        this.attributeDescriptors = attributeDescriptors
        return
    }

    override fun toString(): String {
        return "Project{nodes=$nodes, edges=$edges, attributeTypes=$attributeTypes, attributeDescriptors=$attributeDescriptors, blacklist=$blacklist}"
    }
}
