package de.maibornwolff.codecharta.model

/**
 * The lens-native analysis domain project. Analysis signals live in [lenses] (a [LensSet]); the file
 * tree ([nodes]) is the identity layer. The legacy 1.5 split/flat shapes (`edges`, the
 * `attributeTypes` node/edge map, the flat `attributeDescriptors`) exist only at the wire boundary
 * and inside [ProjectBuilder] — converted explicitly via [LensSet], never exposed on the domain.
 */
class Project(
    val projectName: String,
    private val nodes: List<Node> = listOf(Node("root", NodeType.Folder)),
    val apiVersion: String = API_VERSION,
    val lenses: LensSet = LensSet(),
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

    val rootNode: Node
        get() = nodes[0]

    val size: Int
        get() = rootNode.size

    fun sizeOfEdges(): Int = lenses.dependency.edges.size

    fun sizeOfBlacklist(): Int = blacklist.size

    override fun toString(): String = "Project{projectName=$projectName," +
        " apiVersion=$apiVersion," +
        " nodes=$nodes, lenses=$lenses," +
        " blacklist=$blacklist}"

    companion object {
        private const val API_VERSION_MAJOR = "2"
        private const val API_VERSION_MINOR = "0"
        const val API_VERSION = "$API_VERSION_MAJOR.$API_VERSION_MINOR"

        // 2.0 is the only format the analysis pipeline works with: ccsh emits 2.0 and every command but
        // `convert` reads 2.0 only (1.x must be upgraded first), so the merge gate accepts major 2 only.
        private val SUPPORTED_API_VERSION_MAJORS = setOf("2")

        fun isAPIVersionCompatible(apiVersion: String): Boolean {
            val apiVersionMajor = apiVersion.split('.')[0]
            return apiVersionMajor in SUPPORTED_API_VERSION_MAJORS
        }
    }
}
