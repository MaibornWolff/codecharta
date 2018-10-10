/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
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
    abstract val children: List<Tree<T>>

    val isLeaf: Boolean
        get() {
            return children.isEmpty()
        }

    private val treeNodes: List<TreeNode<T>>
        get() = listOf(TreeNode(Path.trivialPath(), asTreeNode())) +
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