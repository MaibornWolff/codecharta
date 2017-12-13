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

class NodeMerger {
    /**
     * merge nodes, ignoring children
     */
    fun merge(vararg nodes: Node): Node {
        return Node(
                createName(nodes),
                createType(nodes),
                createAttributes(nodes),
                createLink(nodes))
    }

    private fun createLink(nodes: Array<out Node>) = nodes.map { it.link }.filter { it != null && !it.isBlank() }.firstOrNull()

    private fun createAttributes(nodes: Array<out Node>) = nodes.map { it.attributes }.filterNotNull().reduce { acc, mutableMap -> acc.plus(mutableMap) }.orEmpty()

    private fun createType(nodes: Array<out Node>) = nodes.map { it.type }.first()

    private fun createName(nodes: Array<out Node>) = nodes.map { it.name }.first()

    /**
     * merge nodes using mergerStrategy for children
     */
    fun merge(mergerStrategy: NodeMergerStrategy, vararg nodes: Node): Node {
        val node = merge(*nodes)
        node.children.addAll(mergerStrategy.mergeNodeLists(nodes.map { it.children }))
        return node
    }

}
