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

/**
 * merging multiply nodes by using max attribute and link, ignoring children
 */
object NodeMaxAttributeMergerIgnoringChildren : NodeMergerStrategy {
    override fun merge(tree: MutableNode, otherTrees: List<MutableNode>): MutableNode {
        val nodes = listOf(tree).plus(otherTrees)
        return MutableNode(
                createName(tree),
                createType(tree),
                createAttributes(nodes),
                createLink(nodes),
                nodeMergingStrategy = tree.nodeMergingStrategy
        )
    }

    private fun createLink(nodes: List<MutableNode>) = nodes.map { it.link }.firstOrNull { it != null && !it.isBlank() }

    private fun createAttributes(nodes: List<MutableNode>) =
            nodes.map { it.attributes }.
                    reduce { acc, mutableMap -> acc.mergeReduce(mutableMap, {x,y -> maxValOrFirst(x,y)}) }
                    .toMutableMap()

    private fun createType(nodes: MutableNode) = nodes.type

    private fun createName(nodes: MutableNode) = nodes.name

    private fun maxValOrFirst(x: Any, y: Any) : Any  {
        return when {
            x is Long && y is Long -> maxOf(x,y)
            x is Double && y is Double -> maxOf(x,y)
            else -> x
        }
    }

    private fun <K, V> Map<K, V>.mergeReduce(other: Map<K, V>, reduce: (V, V) -> V = { _, b -> b }): Map<K, V> =
            this.toMutableMap().apply { other.forEach { merge(it.key, it.value, reduce) } }
}