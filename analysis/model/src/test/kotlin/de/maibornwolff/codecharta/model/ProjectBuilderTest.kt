package de.maibornwolff.codecharta.model

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class ProjectBuilderTest : Spek({
    describe("ProjectBuilder without root node") {
        val projectBuilder = ProjectBuilder()

        context("inserting new node") {
            val nodeForInsertion = MutableNode("someNode", NodeType.File)
            projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

            it("has node as child of root") {
                val root = projectBuilder.build().rootNode
                assertThat(root.children, hasSize(1))
                assertThat(root.children.toMutableList()[0], NodeMatcher.matchesNode(nodeForInsertion.toNode()))
            }
        }
    }

    describe("ProjectBuilder with root node") {
        val root = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder(listOf(root))

        context("inserting new node") {
            val nodeForInsertion = MutableNode("someNode", NodeType.File)
            projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

            it("creates a Project with root node") {
                val project = projectBuilder.build()
                assertThat(project.rootNode, NodeMatcher.matchesNode(root.toNode()))
                assertThat(root.children, hasSize(1))
                assertThat(root.children.toMutableList()[0], Matchers.`is`(nodeForInsertion))
            }
        }
    }

    describe("ProjectBuilder with empty folders") {
        val projectBuilder = ProjectBuilder()
        val nodeForInsertion = MutableNode("someNode", NodeType.Folder)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

        context("building") {
            val project = projectBuilder.build()

            it("should filter empty folders") {
                val root = project.rootNode
                assertThat(root.children, hasSize(0))
            }
        }
    }
})