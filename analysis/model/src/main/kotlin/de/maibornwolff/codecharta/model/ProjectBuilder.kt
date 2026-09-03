package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import de.maibornwolff.codecharta.util.AttributeGeneratorRegistry
import org.apache.commons.text.similarity.JaccardSimilarity
import org.apache.commons.text.similarity.JaroWinklerSimilarity

open class ProjectBuilder(
    private val nodes: List<MutableNode> = listOf(MutableNode("root", NodeType.Folder)),
    private var edges: MutableList<Edge> = mutableListOf(),
    private var attributeTypes: MutableMap<String, MutableMap<String, AttributeType>> = mutableMapOf(),
    private var attributeDescriptors: MutableMap<String, AttributeDescriptor> = mutableMapOf(),
    private var blacklist: MutableList<BlacklistItem> = mutableListOf()
) {
    init {
        check(nodes.size == 1) { "No unique root node was found, instead ${nodes.size} candidates identified." }
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

    private var filterRule: (MutableNode) -> Boolean = {
        true
    }

    private var opaqueLenses: Map<String, JsonElement> = emptyMap()

    private var domainLens: DomainLens? = null

    private var commitHash: String? = null

    fun withOpaqueLenses(opaqueLenses: Map<String, JsonElement>): ProjectBuilder {
        this.opaqueLenses = opaqueLenses
        return this
    }

    fun withDomainLens(domainLens: DomainLens): ProjectBuilder {
        this.domainLens = domainLens
        return this
    }

    fun withCommitHash(commitHash: String?): ProjectBuilder {
        this.commitHash = commitHash
        return this
    }

    fun withMetricTranslator(metricNameTranslator: MetricNameTranslator): ProjectBuilder {
        this.metricNameTranslator = metricNameTranslator
        return this
    }

    fun withFilter(
        filterRule: (MutableNode) -> Boolean = {
            true
        }
    ): ProjectBuilder {
        this.filterRule = filterRule
        return this
    }

    open fun build(): Project = build(false)

    open fun build(cleanAttributeDescriptors: Boolean = false): Project {
        processNodesAndEdges()
        if (cleanAttributeDescriptors) {
            removeUnusedAttributeDescriptors()
        }
        val baseLenses = LensSet.fromLegacy(edges.toList(), attributeTypes.toMap(), attributeDescriptors.toMap())
        return assembleProject(baseLenses.copy(domain = domainLens, opaqueLenses = opaqueLenses))
    }

    fun buildFromLenses(lenses: LensSet): Project {
        processNodesAndEdges()
        return assembleProject(lenses)
    }

    private fun processNodesAndEdges() {
        nodes
            .flatMap {
                it.nodes.values
            }.mapNotNull {
                it.filterChildren(filterRule, false)
            }.map {
                it.translateMetrics(metricNameTranslator, false)
            }

        edges.forEach {
            it.translateMetrics(metricNameTranslator)
        }

        filterEmptyFolders()
    }

    private fun assembleProject(lenses: LensSet): Project {
        val project =
            Project(
                projectName = DUMMY_PROJECT_NAME,
                nodes = nodes.map { it.toNode() }.toList(),
                lenses = lenses,
                blacklist = blacklist.toList(),
                commitHash = commitHash
            )

        System.err.println()
        System.err.println("Created Project with ${project.size} leaves.")

        return project
    }

    private fun filterEmptyFolders() {
        nodes.forEach {
            it.filterChildren({
                !it.isEmptyFolder
            }, true)
        }
    }

    fun addAttributeTypes(attributeTypesToAdd: AttributeTypes): ProjectBuilder {
        if (!attributeTypes.containsKey(attributeTypesToAdd.type)) {
            attributeTypes[attributeTypesToAdd.type] = attributeTypesToAdd.attributeTypes.toMutableMap()
        } else {
            attributeTypes.getValue(attributeTypesToAdd.type).putAll(attributeTypesToAdd.attributeTypes)
        }
        return this
    }

    fun addAttributeDescriptions(descriptions: Map<String, AttributeDescriptor> = mapOf()): ProjectBuilder {
        val complementedAttributeDescriptors = descriptions.toMutableMap()
        val nodeAttributeNames = this.extractNodeAttributeNames()
        val edgeAttributeNames = this.extractEdgeAttributeNames()

        nodeAttributeNames.forEach { nodeAttributeName ->
            if (!(complementedAttributeDescriptors.keys.contains(nodeAttributeName))) {
                addAttributeDescriptorWithEstimatedDirection(nodeAttributeName, complementedAttributeDescriptors)
            }
        }

        edgeAttributeNames.forEach { edgeAttributeName ->
            if (!(complementedAttributeDescriptors.keys.contains(edgeAttributeName))) {
                addAttributeDescriptorWithEstimatedDirection(edgeAttributeName, complementedAttributeDescriptors)
            }
        }

        attributeDescriptors.putAll(complementedAttributeDescriptors)
        return this
    }

    private fun addAttributeDescriptorWithEstimatedDirection(
        nodeAttributeName: String,
        complementedAttributeDescriptors: MutableMap<String, AttributeDescriptor>
    ) {
        complementedAttributeDescriptors[nodeAttributeName] =
            AttributeDescriptor(title = nodeAttributeName, direction = estimateDirection(nodeAttributeName))
    }

    private fun estimateDirection(nodeAttributeName: String): Int {
        val avgSimilarityThreshold = 0.85
        val attributeDescriptors = AttributeGeneratorRegistry.getAllAttributeDescriptors()
        val attributeDescriptorNames = attributeDescriptors.keys.distinct()

        val strippedNodeAttributeName = nodeAttributeName.lowercase().replace("[^a-zäöüß]".toRegex(), "")
        if (getCodeMetricsPositiveDirectionEnglish().any {
                it in strippedNodeAttributeName
            } &&
            !(getCodeMetricsNegativeDirectionEnglish()).any {
                it in strippedNodeAttributeName
            }
        ) {
            return 1
        }
        if (getCodeMetricsPositiveDirectionGerman().any {
                it in strippedNodeAttributeName
            } &&
            !(getCodeMetricsNegativeDirectionGerman()).any {
                it in strippedNodeAttributeName
            }
        ) {
            return 1
        }

        val attributeDescriptorNamesByAvgSimilarities =
            attributeDescriptorNames.associateWith { attributeDescriptorName ->
                calculateAvgSimilarity(nodeAttributeName, attributeDescriptorName)
            }

        val attributeDescriptorNameWithMaxAvgSimilarity: Map.Entry<String, Double>? =
            attributeDescriptorNamesByAvgSimilarities.maxByOrNull {
                it.value
            }

        if (attributeDescriptorNameWithMaxAvgSimilarity != null &&
            attributeDescriptorNameWithMaxAvgSimilarity.value >= avgSimilarityThreshold
        ) {
            val attributeDescriptorWithMaxAvgSimilarity =
                attributeDescriptors[attributeDescriptorNameWithMaxAvgSimilarity.key]
            if (attributeDescriptorWithMaxAvgSimilarity != null) {
                return attributeDescriptorWithMaxAvgSimilarity.direction
            }
        }

        return -1
    }

    private fun calculateAvgSimilarity(nodeAttributeName: String, attributeDescriptorName: String): Double {
        val jacquardSimilarity = JaccardSimilarity().apply(nodeAttributeName, attributeDescriptorName)
        val jaroWinklerSimilarity = JaroWinklerSimilarity().apply(nodeAttributeName, attributeDescriptorName)
        return (jacquardSimilarity + jaroWinklerSimilarity) / 2
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
            if (attributeSet.isEmpty()) {
                return
            }
        }

        val attributeDescriptors = this.attributeDescriptors.toMutableMap()
        attributeSet.forEach {
            attributeDescriptors.remove(it)
        }
        this.attributeDescriptors = attributeDescriptors
        return
    }

    private fun extractNodeAttributeNames(): Set<String> {
        val attributeNames = mutableSetOf<String>()

        fun traverse(node: MutableNode) {
            attributeNames.addAll(node.attributes.keys)
            node.children.forEach { child -> traverse(child) }
        }

        nodes.forEach { node -> traverse(node) }

        return attributeNames
    }

    private fun extractEdgeAttributeNames(): Set<String> {
        val attributeNames = mutableSetOf<String>()

        edges.forEach { edge ->
            attributeNames.addAll(edge.attributes.keys)
        }

        return attributeNames
    }

    private fun getCodeMetricsPositiveDirectionEnglish(): List<String> = listOf(
        "covered", "coverage", "review", "reviewed", "documentation", "documented", "success",
        "succeeded", "fix", "fixed", "completion", "complete", "augmentation", "augmented", "enhancement",
        "enhanced", "improvement", "improved", "added", "addition", "efficient", "efficiency", "velocity",
        "reusable", "reusability", "reduced", "reduction"
    )

    private fun getCodeMetricsNegativeDirectionEnglish(): List<String> = listOf(
        "unchecked", "uncovered", "not", "failed", "failure", "reopened", "violation", "violated",
        "duplication", "duplicated", "skipped", "error", "wont"
    )

    private fun getCodeMetricsPositiveDirectionGerman(): List<String> = listOf(
        "abgedeckt", "abdeckung", "überprüft", "dokumentation", "dokumentiert", "erfolg", "erfolgreich",
        "beheben", "behoben", "vollständig", "erweitert", "verbessert", "hinzugefügt", "effizient", "effizienz",
        "geschwindigkeit", "wiederverwendbar", "wiederverwendbarkeit"
    )

    private fun getCodeMetricsNegativeDirectionGerman(): List<String> =
        listOf("ungeprüft", "nicht", "gescheitert", "fehler", "wiedereröffnet", "dupliziert", "übersprungen")

    override fun toString(): String = "Project{nodes=$nodes," +
        " edges=$edges," +
        " attributeTypes=$attributeTypes," +
        " attributeDescriptors=$attributeDescriptors," +
        " blacklist=$blacklist}"

    companion object {
        const val DUMMY_PROJECT_NAME = ""

        // Takes the whole lens set rather than its parts, so a filter that rebuilds a project carries
        // every lens it does not touch — including the ones added after the filter was written.
        fun fromLenses(
            nodes: List<MutableNode>,
            lenses: LensSet,
            blacklist: MutableList<BlacklistItem> = mutableListOf(),
            commitHash: String? = null
        ): ProjectBuilder {
            val builder =
                ProjectBuilder(
                    nodes,
                    lenses.dependency.edges.toMutableList(),
                    lenses.legacyAttributeTypes().toMutableMap(),
                    lenses.allAttributeDescriptors().toMutableMap(),
                    blacklist
                ).withOpaqueLenses(lenses.opaqueLenses)
                    .withCommitHash(commitHash)
            return lenses.domain?.let { builder.withDomainLens(it) } ?: builder
        }
    }
}
