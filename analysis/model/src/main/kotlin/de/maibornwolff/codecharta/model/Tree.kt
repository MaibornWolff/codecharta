package de.maibornwolff.codecharta.model

import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

/**
 * tree structure
 *
 * @param <T> must satisfy T = Tree<T>
 */
abstract class Tree<T> {
    /**
     * @return children of the present tree
     */
    abstract val children: Set<Tree<T>>
    val isLeaf: Boolean
        get() {
            return children.isEmpty()
        }
    private val treeNodes: Set<TreeNode<T>>
        get() = setOf(TreeNode(Path.trivialPath(), asTreeNode())) +
            children.flatMap { child ->
                child.treeNodes.map { TreeNode(getPathOfChild(child).concat(it.path), it.node) }
            }
    val nodes: Map<Path, T>
        get() = treeNodes.map { it.path to it.node }.toMap()
    val leaves: Map<Path, T>
        get() = treeNodes.filter { (it.node as Tree<*>).isLeaf }.map { it.path to it.node }.toMap()

    /**
     * @return size as number of leaves
     */
    val size: Int
        get() = leaves.size

    /**
     * @return all leafs of object
     */
    val leafObjects: List<T>
        get() = treeNodes.filter { (it.node as Tree<*>).isLeaf }.map { it.node }

    /**
     * @return all paths to leafs of object
     */
    val pathsToLeaves: List<Path>
        get() = treeNodes.filter { (it.node as Tree<*>).isLeaf }.map { it.path }

    /**
     * get's the path of a given child, i.e. defines the edge to the child.
     *
     * @param child to be found
     * @return path of child in this object
     */
    abstract fun getPathOfChild(child: Tree<T>): Path
    private class TreeNode<out V> internal constructor(internal val path: Path, internal val node: V)

    /**
     * @param path path in tree
     * @return subtree under this path
     */
    fun getNodeBy(path: Path): Tree<T>? {
        return when {
            path.isTrivial -> this
            path.isSingle -> children.first { path == getPathOfChild(it) }
            else -> getNodeBy(Path(listOf(path.head)))!!.getNodeBy(path.tail)
        }
    }

    open fun merge(nodes: List<T>): T {
        logger.warn { "Element already exists, skipping." }
        return asTreeNode()
    }

    // attention!!! Tree<T> = T
    fun asTreeNode(): T {
        return this as T
    }

    abstract fun insertAt(path: Path, node: T)
}