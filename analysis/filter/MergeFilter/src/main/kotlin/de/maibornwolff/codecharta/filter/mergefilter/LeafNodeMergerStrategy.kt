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

package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.nodeinserter.NodeInserter

/**
 * merges leafs according to the level of matching of their paths
 */
class LeafNodeMergerStrategy(val addMisfittingNodes: Boolean) : NodeMergerStrategy {
    private val flatNodeMerger = NodeMerger()

    private val mergeConditionSatisfied = { n1: Node, n2: Node -> n1.name == n2.name }
    /**
     * merge list of nodeLists to single nodeList
     */
    override fun mergeNodeLists(lists: List<List<Node>>?): List<Node> {
        if (lists!!.isEmpty()) {
            return listOf()
        }
        val reference = lists.first()
        return lists.drop(1)
                .fold(reference, { acc1, nodes ->
                    nodes.fold(acc1, { acc2: List<Node>, node: Node ->
                        acc2.flatMap { if (mergeConditionSatisfied(it, node)) merge(it, node) else listOf(it) }
                    })
                })
    }

    /**
     * merge multiple nodes
     */
    private fun merge(vararg nodes: Node): List<Node> {
        val root = flatNodeMerger.merge(*nodes)
        val reference = nodes.first().nodes
        nodes.drop(1).toList()
                .fold(reference, { acc, node -> mergeInto(acc, node.nodes) })
                .forEach { NodeInserter.insertByPath(root, Path(it.key.edgesList.dropLast(1)), it.value) }
        return listOf(root)
    }

    private fun mergeInto(acc: Map<Path, Node>, nodes: Map<Path, Node>): Map<Path, Node> {
        val newNodes = nodes.filterValues { it.isLeaf }
                .mapKeys { findFittingPathOrNull(acc.keys, it.key) ?: replaceMisfittingPath(it.key) }
                .filterKeys { !it.isTrivial }
        val unchangedNodes = acc.filterValues { it.isLeaf }.filterKeys { !newNodes.keys.contains(it) }

        return newNodes
                .plus(unchangedNodes)
                .mapValues { flatNodeMerger.merge(it.value, acc[it.key] ?: it.value) }
    }

    private fun replaceMisfittingPath(path: Path): Path {
        return when {
            addMisfittingNodes -> path
            else -> Path.TRIVIAL
        }
    }

    private fun pathDistance(path1: Path, path2: Path): Int {
        val reversedEdges1 = path1.edgesList.asReversed()
        val reversedEdges2 = path2.edgesList.asReversed()
        val minSize = minOf(reversedEdges1.size, reversedEdges2.size)
        return (0..minSize - 1).firstOrNull { reversedEdges1[it] != reversedEdges2[it] } ?: minSize
    }

    private fun findFittingPathOrNull(reference: Set<Path>, path: Path): Path? {
        val matchingLeaf = reference.filter { !it.isTrivial }.maxBy { pathDistance(path, it) } ?: path
        return when {
            pathDistance(path, matchingLeaf) == 0 -> null
            else -> matchingLeaf
        }
    }
}
