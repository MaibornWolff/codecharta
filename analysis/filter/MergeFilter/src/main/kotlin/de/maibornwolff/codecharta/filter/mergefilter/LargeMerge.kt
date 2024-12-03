package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project

class LargeMerge {
    companion object {
        fun packageProjectInto(project: Project, prefix: String): Project {
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
            val newRoot = Node(
                name = folderName,
                type = NodeType.Folder,
                children = root.children
            )
            val mutableRoot = root.toMutableNode()
            mutableRoot.children = mutableSetOf(newRoot.toMutableNode())
            return listOf(mutableRoot.toNode())
        }

        private fun addFolderToEdgePaths(edges: List<Edge>, folderName: String): List<Edge> {
            edges.forEach {
                it.fromNodeName = insertFolderIntoPath(it.fromNodeName, folderName)
                it.toNodeName = insertFolderIntoPath(it.toNodeName, folderName)
            }
            return edges
        }

        private fun addFolderToBlackListPaths(blacklist: List<BlacklistItem>, folderName: String): List<BlacklistItem> {
            blacklist.forEach {
                it.path = insertFolderIntoPath(it.path, folderName)
            }
            return blacklist
        }

        private fun insertFolderIntoPath(path: String, folderName: String): String {
            return path.replace(Regex("^/root/"), "/root/$folderName/")
        }
    }
}
