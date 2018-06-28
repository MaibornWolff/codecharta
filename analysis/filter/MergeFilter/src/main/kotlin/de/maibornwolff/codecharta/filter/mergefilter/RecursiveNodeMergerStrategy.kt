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

import de.maibornwolff.codecharta.model.MutableNode

/**
 * merges nodes recursively if their paths coincide
 */
class RecursiveNodeMergerStrategy(ignoreCase: Boolean = false) : NodeMergerStrategy {
    private val mergeConditionSatisfied: (MutableNode, MutableNode) -> Boolean

    init {
        mergeConditionSatisfied = if (ignoreCase) { n1: MutableNode, n2: MutableNode -> n1.name.toUpperCase() == n2.name.toUpperCase() }
        else { n1: MutableNode, n2: MutableNode -> n1.name == n2.name }
    }

    override fun mergeNodeLists(lists: List<List<MutableNode>>): List<MutableNode> {
        return if (lists.isEmpty()) listOf()
        else lists.reduce { total, next ->
            next.fold(total, { t: List<MutableNode>, a: MutableNode ->
                t.map { if (mergeConditionSatisfied(it, a)) merge(it, a) else it }.map { listOf(it) }
                when {
                    t.filter { mergeConditionSatisfied(it, a) }.count() > 0 ->
                        t.map { if (mergeConditionSatisfied(it, a)) merge(it, a) else it }
                    else -> t + a
                }
            })
        }
    }

    private fun merge(vararg nodes: MutableNode): MutableNode {
        val node = nodes[0].merge(nodes.toList())
        node.children.addAll(this.mergeNodeLists(nodes.map { it.children }))
        return node
    }
}
