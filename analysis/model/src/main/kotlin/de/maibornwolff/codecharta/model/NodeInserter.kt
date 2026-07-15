package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

object NodeInserter {
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
            val original = getMergeableNode(root, node)
            if (original != null) {
                root.children.remove(original)
                val mergedNode = original.merge(listOf(node))

                root.children.add(mergedNode)

                Logger.debug {
                    "Node with name ${node.name} already exists, merging $original and $node to $mergedNode."
                }
            } else {
                root.children.add(node)
            }
        } else {
            val name = path.head
            // Look the created folder back up via getFolderNode (not Tree.getNodeBy, which matches by
            // name only): insertNewFolderNode may have just added it as a sibling of a same-named File,
            // and a name-only lookup could resolve back to that File instead of the folder we need.
            val folderNode = getFolderNode(root, name) ?: root.insertNewFolderNode(name).let { getFolderNode(it, name)!! }
            insertByPath(folderNode, path.tail, node)
        }
        return root
    }

    // A File and a Folder that share a name are genuinely distinct nodes (mirrors
    // UnionMergeResolver.isFileFolderClash): merging them would flip one's type via
    // NodeMaxAttributeMerger.createType while silently keeping the other's children, emitting a
    // structurally invalid node (finding 7e). Refuse only that clash; every other same-named pairing
    // (equal types, or a type that is neither File nor Folder acting as a wildcard) still merges as
    // before, so the incoming node falls through to being added as a separate sibling instead.
    private fun getMergeableNode(root: MutableNode, node: MutableNode): MutableNode? = root.children.firstOrNull {
        it.name == node.name && !isFileFolderClash(it.type, node.type)
    }

    private fun isFileFolderClash(first: NodeType?, second: NodeType?): Boolean =
        (first == NodeType.File && second == NodeType.Folder) || (first == NodeType.Folder && second == NodeType.File)

    // Type-aware parent lookup used while walking a path: a same-named File must never be mistaken for
    // the Folder parent a path traversal expects to descend into (finding 7e). A miss falls through to
    // insertNewFolderNode, which creates a Folder sibling instead of corrupting the File.
    private fun getFolderNode(root: MutableNode, name: String): MutableNode? = root.children.firstOrNull {
        it.name == name && it.type == NodeType.Folder
    }

    private fun createFolderNode(name: String): MutableNode =
        MutableNode(name, NodeType.Folder, nodeMergingStrategy = NodeMaxAttributeMerger(true))

    private fun MutableNode.insertNewFolderNode(name: String): MutableNode {
        val folderNode = createFolderNode(name)
        insertByPath(this, Path.TRIVIAL, folderNode)
        return this
    }
}
