package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

object NodeInserter {
    /**
     * Inserts [node] into the sub-tree of [root] as a child of the element addressed by [path],
     * creating missing folder nodes along the way.
     */
    fun insertByPath(root: MutableNode, path: Path, node: MutableNode): MutableNode {
        if (path.isTrivial) {
            insertOrMergeChild(root, node)
        } else {
            val folderName = path.head
            // A name-only lookup could resolve to a same-named File; the traversal must descend
            // into the Folder, creating it first if necessary.
            val folderNode = findFolderChild(root, folderName) ?: insertNewFolderChild(root, folderName)
            insertByPath(folderNode, path.tail, node)
        }
        return root
    }

    private fun insertOrMergeChild(parent: MutableNode, node: MutableNode) {
        val mergeableChild = findMergeableChild(parent, node)
        if (mergeableChild == null) {
            parent.children.add(node)
            return
        }
        parent.children.remove(mergeableChild)
        val mergedNode = mergeableChild.merge(listOf(node))
        parent.children.add(mergedNode)
        Logger.debug {
            "Node with name ${node.name} already exists, merging $mergeableChild and $node to $mergedNode."
        }
    }

    // A File and a Folder sharing a name are distinct nodes (mirrors UnionMergeResolver.isFileFolderClash):
    // merging them would flip one node's type while keeping the other's children, yielding a structurally
    // invalid node. The incoming node is added as a separate sibling instead.
    private fun findMergeableChild(parent: MutableNode, node: MutableNode): MutableNode? = parent.children.firstOrNull {
        it.name == node.name && !isFileFolderClash(it.type, node.type)
    }

    private fun isFileFolderClash(first: NodeType?, second: NodeType?): Boolean =
        (first == NodeType.File && second == NodeType.Folder) || (first == NodeType.Folder && second == NodeType.File)

    private fun findFolderChild(parent: MutableNode, name: String): MutableNode? = parent.children.firstOrNull {
        it.name == name && it.type == NodeType.Folder
    }

    private fun insertNewFolderChild(parent: MutableNode, name: String): MutableNode {
        val folderNode = MutableNode(name, NodeType.Folder, nodeMergingStrategy = NodeMaxAttributeMerger(true))
        insertByPath(parent, Path.TRIVIAL, folderNode)
        // The inserted folder may have been merged with an existing child, so look up the result.
        return findFolderChild(parent, name)!!
    }
}
