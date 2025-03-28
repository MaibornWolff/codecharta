package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class LargeMerge {
    companion object {
        fun wrapProjectInFolder(project: Project, prefix: String): Project {
            val modifiedProject = Project(
                project.projectName,
                moveNodesIntoFolder(project.rootNode, prefix),
                project.apiVersion,
                addFolderToEdgePaths(project.edges, prefix),
                project.attributeTypes,
                project.attributeDescriptors,
                addFolderToBlackListPaths(project.blacklist, prefix)
            )
            return modifiedProject
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

        private fun addFolderToEdgePaths(edges: List<Edge>, folderName: String): List<Edge> {
            return edges.map { edge ->
                Edge(
                    fromNodeName = insertFolderIntoPath(edge.fromNodeName, folderName),
                    toNodeName = insertFolderIntoPath(edge.toNodeName, folderName),
                    attributes = edge.attributes
                )
            }
        }

        private fun addFolderToBlackListPaths(blacklist: List<BlacklistItem>, folderName: String): List<BlacklistItem> {
            return blacklist.map { item ->
                BlacklistItem(
                    path = insertFolderIntoPath(item.path, folderName),
                    type = item.type
                )
            }
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
