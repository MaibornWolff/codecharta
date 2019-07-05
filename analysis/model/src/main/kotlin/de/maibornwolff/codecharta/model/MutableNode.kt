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

import de.maibornwolff.codecharta.translator.MetricNameTranslator
import java.util.*

class MutableNode constructor(
        val name: String,
        val type: NodeType? = NodeType.File,
        var attributes: Map<String, Any> = mapOf(),
        val link: String? = "",
        childrenList: List<MutableNode> = listOf(),
        @Transient val nodeMergingStrategy: NodeMergerStrategy = NodeMaxAttributeMerger()
): Tree<MutableNode>() {

    override var children = childrenList.toMutableList()

    override fun getPathOfChild(child: Tree<MutableNode>): Path {
        if (!children.contains(child)) {
            throw NoSuchElementException("Child $child not contained in MutableNode.")
        }
        return Path(listOf((child.asTreeNode()).name))
    }

    override fun toString(): String {
        return "MutableNode(name='$name', type=$type, attributes=$attributes, link=$link, children=$children)"
    }

    override fun insertAt(path: Path, node: MutableNode) {
        NodeInserter.insertByPath(this, path, node)
    }

    override fun merge(nodes: List<MutableNode>): MutableNode {
        return nodeMergingStrategy.merge(this, nodes)
    }

    fun translateMetrics(metricNameTranslator: MetricNameTranslator, recursive: Boolean = false): MutableNode {
        if (recursive) {
            children.forEach { it.translateMetrics(metricNameTranslator, recursive) }
        }
        attributes = attributes.mapKeys { metricNameTranslator.translate(it.key) }.filterKeys { it.isNotBlank() }

        return this
    }

    fun toNode(): Node {
        return Node(name, type, attributes, link, children = children.map { it.toNode() }.toList())
    }

    val isEmptyFolder
        get() = type == NodeType.Folder && children.isEmpty()

    fun filterChildren(filterRule: (MutableNode) -> Boolean, recursive: Boolean = false): MutableNode? {
        children.removeAll { !filterRule(it) }
        if (recursive) {
            children.forEach { it.filterChildren(filterRule, recursive) }
        }
        children.removeAll { !filterRule(it) }

        return when {
            children.isEmpty() && type == NodeType.Folder -> null
            else                                          -> this
        }
    }
}