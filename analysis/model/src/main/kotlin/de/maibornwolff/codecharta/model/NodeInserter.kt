package de.maibornwolff.codecharta.model

import mu.KotlinLogging

object NodeInserter {
    private val logger = KotlinLogging.logger {}

    /**
     * Inserts the node as child of the element at the specified position
     * in the sub-tree spanned by the children of the root node.
     *
     * @param root where another node should be inserted
     * @param path relative path to parent of new node in root node
     * @param node that has to be inserted
     */
    fun insertByPath(root: MutableNode, path: Path, node: MutableNode): MutableNode {
        if (path.isTrivial) {
            if (rootContainsNodeAlready(root, node)) {
                val original = getNode(root, node.name)!!
                root.children.remove(original)
                val mergedNode = original.merge(listOf(node))

                root.children.add(mergedNode)

                logger.debug {
                    "Node with name ${node.name} already exists, merging $original and $node to $mergedNode."
                }
            } else {
                root.children.add(node)
            }
        } else {

            val name = path.head
            val folderNode = getNode(root, name)
                             ?: root.insertNewFolderNode(name).getNodeBy(Path(name)) as MutableNode
            insertByPath(folderNode, path.tail, node)
        }
        return root
    }

    private fun getNode(root: MutableNode, name: String): MutableNode? {
        return root.children.firstOrNull { it.name == name }
    }

    private fun rootContainsNodeAlready(root: MutableNode, node: MutableNode): Boolean {
        return root.children.filter { it.name == node.name }.count() > 0
    }

    private fun createFolderNode(name: String): MutableNode {
        return MutableNode(name, NodeType.Folder, nodeMergingStrategy = NodeMaxAttributeMerger(true))
    }

    private fun MutableNode.insertNewFolderNode(name: String): MutableNode {
        val folderNode = createFolderNode(name)
        insertByPath(this, Path.TRIVIAL, folderNode)
        return this
    }
}