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

import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher

object NodeMatcher {

    fun matchesNode(expectedNode: Node): Matcher<Node> {
        return object : BaseMatcher<Node>() {


            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedNode)
            }

            override fun matches(item: Any): Boolean {
                return match(item as Node, expectedNode)
            }
        }
    }

    fun match(n1: Node, n2: Node): Boolean {
        return n1.name == n2.name
                && n1.type == n2.type
                && linksMatch(n1, n2)
                && n1.attributes == n2.attributes
                && n1.children.size == n2.children.size
                && n1.children.indices
                .map { match(n1.children[it], n2.children[it]) }
                .fold(true) { x, y -> x && y }
    }

    private fun linksMatch(n1: Node, n2: Node) =
            n1.link == n2.link || (n1.link.isNullOrEmpty() && n2.link.isNullOrEmpty())

    fun hasNodeAtPath(node: Node, path: Path): Matcher<Node> {
        return object : BaseMatcher<Node>() {
            private var nodeAtPath: Node? = null

            override fun describeTo(description: Description) {
                description.appendText("paths should contain ").appendValue(node).appendText(" at ").appendValue(path)
            }

            override fun matches(item: Any?): Boolean {
                nodeAtPath = (item as Node).getNodeBy(path) as Node
                return if (nodeAtPath == null) item == null else match(nodeAtPath!!, node)
            }

            override fun describeMismatch(item: Any, description: Description) {
                description.appendText("but was ").appendValue(nodeAtPath)
                description.appendText(", where paths to leaves were ").appendValue((item as MutableNode).pathsToLeaves)
            }
        }
    }

}
