package de.maibornwolff.codecharta.model

class Project(
    val projectName: String,
    private val nodes: List<Node> = listOf(Node("root", NodeType.Folder)),
    val apiVersion: String = API_VERSION,
    val edges: List<Edge> = listOf(),
    val attributeTypes: Map<String, MutableMap<String, AttributeType>> = mapOf(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = mapOf(),
    var blacklist: List<BlacklistItem> = listOf()
) {
    init {
        if (nodes.size != 1) throw IllegalStateException("no root node present in project")
    }

    val rootNode: Node
        get() = nodes[0]

    val size: Int
        get() = rootNode.size

    fun sizeOfEdges(): Int {
        return edges.size
    }

    fun sizeOfBlacklist(): Int {
        return blacklist.size
    }

    override fun toString(): String {
        return "Project{projectName=$projectName," +
            " apiVersion=$apiVersion," +
            " nodes=$nodes, edges=$edges," +
            " attributeTypes=$attributeTypes," +
            " attributeDescriptors=$attributeDescriptors," +
            " blacklist=$blacklist}"
    }

    companion object {
        private const val API_VERSION_MAJOR = "1"
        private const val API_VERSION_MINOR = "3"
        const val API_VERSION = "$API_VERSION_MAJOR.$API_VERSION_MINOR"

        fun isAPIVersionCompatible(apiVersion: String): Boolean {
            val apiVersionMajor = apiVersion.split('.')[0]
            return apiVersionMajor == API_VERSION_MAJOR
        }
    }
}
