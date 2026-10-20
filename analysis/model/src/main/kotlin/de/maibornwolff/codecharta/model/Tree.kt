package de.maibornwolff.codecharta.model

import de.maibornwolff.codecharta.util.Logger

// T must be the implementing class itself (T = Tree<T>), because [asTreeNode] casts the tree to it
abstract class Tree<T> {
    abstract val children: Set<Tree<T>>

    val isLeaf: Boolean
        get() {
            return children.isEmpty()
        }

    private val treeNodes: Set<TreeNode<T>>
        get() =
            setOf(TreeNode(Path.trivialPath(), asTreeNode())) +
                children.flatMap { child ->
                    child.treeNodes.map {
                        TreeNode(getPathOfChild(child).concat(it.path), it.node)
                    }
                }

    val nodes: Map<Path, T>
        get() =
            treeNodes
                .map {
                    it.path to it.node
                }.toMap()

    val leaves: Map<Path, T>
        get() =
            treeNodes
                .filter {
                    (it.node as Tree<*>).isLeaf
                }.map {
                    it.path to it.node
                }.toMap()

    val size: Int
        get() = leaves.size

    val leafObjects: List<T>
        get() =
            treeNodes
                .filter {
                    (it.node as Tree<*>).isLeaf
                }.map { it.node }

    val pathsToLeaves: List<Path>
        get() =
            treeNodes
                .filter {
                    (it.node as Tree<*>).isLeaf
                }.map { it.path }

    abstract fun getPathOfChild(child: Tree<T>): Path

    private class TreeNode<out V>(val path: Path, val node: V)

    fun getNodeBy(path: Path): Tree<T>? = when {
        path.isTrivial -> this
        path.isSingle ->
            children.first {
                path == getPathOfChild(it)
            }

        else -> getNodeBy(Path(listOf(path.head)))!!.getNodeBy(path.tail)
    }

    open fun merge(nodes: List<T>): T {
        Logger.warn {
            "Element already exists, skipping."
        }
        return asTreeNode()
    }

    fun asTreeNode(): T {
        @Suppress("UNCHECKED_CAST")
        return this as T
    }

    abstract fun insertAt(path: Path, node: T)
}
