package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.attributeTypes.AttributeTypes
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import mu.KotlinLogging

open class ProjectBuilder(
        private val nodes: List<MutableNode> = listOf(MutableNode("root", NodeType.Folder)),
        private var edges: MutableList<Edge> = mutableListOf(),
        private var attributeTypes: MutableMap<String, MutableList<Map<String, AttributeType>>> = mutableMapOf(),
        private var blacklist: MutableList<BlacklistItem> = mutableListOf()
) {

    val DUMMY_PROJECT_NAME = ""

    init {
        if (nodes.size != 1) throw IllegalStateException("No unique root node was found, instead ${nodes.size} candidates identified.")
    }

    private val logger = KotlinLogging.logger {}

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

    fun build(): Project {
        nodes.flatMap { it.nodes.values }
                .mapNotNull { it.filterChildren(filterRule, false) }
                .map { it.translateMetrics(metricNameTranslator, false) }

        edges.forEach { it.translateMetrics(metricNameTranslator) }

        filterEmptyFolders()

        val project = Project(
                DUMMY_PROJECT_NAME,
                nodes.map { it.toNode() }.toList(),
                edges = edges.toList(),
                attributeTypes = attributeTypes.toMap(),
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
            attributeTypes[attributeTypesToAdd.type] = mutableListOf(attributeTypesToAdd.attributeTypes)
        } else {
            attributeTypes[attributeTypesToAdd.type]!!.add(attributeTypesToAdd.attributeTypes)
        }
        return this
    }

    override fun toString(): String {
        return "Project{nodes=$nodes, edges=$edges, attributeTypes=$attributeTypes, blacklist=$blacklist}"
    }
}