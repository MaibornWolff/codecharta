package de.maibornwolff.codecharta.model

/**
 * The analysis domain project. Its canonical analysis-signal store is the lens-native [lenses]
 * ([LensSet]); the file tree ([nodes]) is the identity layer. A legacy constructor and the
 * `edges`/`attributeTypes`/`attributeDescriptors` accessors keep 1.5-era producers and consumers
 * working while the storage is lens-native.
 */
class Project(
    val projectName: String,
    private val nodes: List<Node> = listOf(Node("root", NodeType.Folder)),
    val apiVersion: String = API_VERSION,
    val lenses: LensSet,
    // blacklist is visualization view state: it is dropped from the 2.0 wire format but kept on the
    // domain as a 1.5/filter-time concept for its analysis consumers (MergeFilter dedup,
    // StructureModifier and LargeMerge path rewrites). A project read from 2.0 carries an empty list.
    var blacklist: List<BlacklistItem> = listOf(),
    // Optional short git SHA carried by meta.commitHash in 2.0; absent in 1.5 (which has no meta).
    val commitHash: String? = null
) {
    init {
        check(nodes.size == 1) { "no root node present in project" }
    }

    /** Legacy 1.5-shaped constructor: folds the flat edges/attributeTypes/descriptors into [LensSet]. */
    constructor(
        projectName: String,
        nodes: List<Node> = listOf(Node("root", NodeType.Folder)),
        apiVersion: String = API_VERSION,
        edges: List<Edge> = listOf(),
        attributeTypes: Map<String, MutableMap<String, AttributeType>> = mapOf(),
        attributeDescriptors: Map<String, AttributeDescriptor> = mapOf(),
        blacklist: List<BlacklistItem> = listOf()
    ) : this(projectName, nodes, apiVersion, LensSet.fromLegacy(edges, attributeTypes, attributeDescriptors), blacklist)

    val rootNode: Node
        get() = nodes[0]

    val edges: List<Edge>
        get() = lenses.dependency.edges

    val attributeTypes: Map<String, MutableMap<String, AttributeType>>
        get() = lenses.legacyAttributeTypes()

    val attributeDescriptors: Map<String, AttributeDescriptor>
        get() = lenses.allAttributeDescriptors()

    val size: Int
        get() = rootNode.size

    fun sizeOfEdges(): Int = edges.size

    fun sizeOfBlacklist(): Int = blacklist.size

    override fun toString(): String = "Project{projectName=$projectName," +
        " apiVersion=$apiVersion," +
        " nodes=$nodes, edges=$edges," +
        " attributeTypes=$attributeTypes," +
        " attributeDescriptors=$attributeDescriptors," +
        " blacklist=$blacklist}"

    companion object {
        private const val API_VERSION_MAJOR = "1"
        private const val API_VERSION_MINOR = "5"
        const val API_VERSION = "$API_VERSION_MAJOR.$API_VERSION_MINOR"

        // The 1.5 (legacy) and 2.0 (lens) formats are both readable, so a 2.0 producer can be piped
        // into a filter without tripping the merge compatibility gate.
        private val SUPPORTED_API_VERSION_MAJORS = setOf("1", "2")

        fun isAPIVersionCompatible(apiVersion: String): Boolean {
            val apiVersionMajor = apiVersion.split('.')[0]
            return apiVersionMajor in SUPPORTED_API_VERSION_MAJORS
        }
    }
}
