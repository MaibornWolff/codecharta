package de.maibornwolff.codecharta.model

import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher

object NodeMatcher {

    fun matchesNode(expectedNode: Node): Matcher<Node> {
        return object: BaseMatcher<Node>() {

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
                       .map { match(n1.children.toMutableList()[it], n2.children.toMutableList()[it]) }
                       .fold(true) { x, y -> x && y }
    }

    private fun linksMatch(n1: Node, n2: Node) =
            n1.link == n2.link || (n1.link.isNullOrEmpty() && n2.link.isNullOrEmpty())

    fun hasNodeAtPath(node: Node, path: Path): Matcher<Node> {
        return object: BaseMatcher<Node>() {
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
