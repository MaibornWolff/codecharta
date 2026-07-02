package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class LargeMerge {
    companion object {
        private const val ROOT_NODE_NAME = "root"

        fun wrapProjectInFolder(project: Project, prefix: String): Project {
            // Detect a non-"root" base directly: edge endpoints always carry the synthetic "root"
            // prefix once read, so the root node name is the reliable signal (not the edge paths).
            require(project.rootNode.name == ROOT_NODE_NAME) {
                "Input project structure doesn't have '/root/' as a base folder. If that's intended open an issue."
            }
            // Only the dependency edges are re-pathed; metrics and all other lens data are preserved.
            val rePathedDependency = project.lenses.dependency.copy(edges = addFolderToEdgePaths(project.lenses.dependency.edges, prefix))
            return Project(
                projectName = project.projectName,
                nodes = moveNodesIntoFolder(project.rootNode, prefix),
                apiVersion = project.apiVersion,
                lenses = project.lenses.copy(dependency = rePathedDependency),
                blacklist = addFolderToBlackListPaths(project.blacklist, prefix),
                commitHash = project.commitHash
            )
        }

        private fun moveNodesIntoFolder(root: Node, folderName: String): List<Node> {
            val folderNode = Node(
                name = folderName,
                type = NodeType.Folder,
                children = root.children
            )
            val mutableRoot = root.toMutableNode()
            mutableRoot.children = mutableSetOf(folderNode.toMutableNode())
            return listOf(mutableRoot.toNode())
        }

        private fun addFolderToEdgePaths(edges: List<Edge>, folderName: String): List<Edge> = edges.map { edge ->
            Edge(
                fromNodeName = insertFolderIntoPath(edge.fromNodeName, folderName),
                toNodeName = insertFolderIntoPath(edge.toNodeName, folderName),
                attributes = edge.attributes
            )
        }

        private fun addFolderToBlackListPaths(blacklist: List<BlacklistItem>, folderName: String): List<BlacklistItem> =
            blacklist.map { item ->
                BlacklistItem(
                    path = insertFolderIntoPath(item.path, folderName),
                    type = item.type
                )
            }

        private fun insertFolderIntoPath(path: String, folderName: String): String {
            val rootRegex = Regex("^/root/")
            require(rootRegex.containsMatchIn(path)) {
                "Input project structure doesn't have '/root/' as a base folder. If that's intended open an issue."
            }
            return path.replace(Regex("^/root/"), "/root/$folderName/")
        }
    }
}
