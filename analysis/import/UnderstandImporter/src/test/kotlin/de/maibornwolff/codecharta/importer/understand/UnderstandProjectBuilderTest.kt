package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.model.NodeType
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.greaterThanOrEqualTo
import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class UnderstandProjectBuilderTest : Spek({

    describe("UnderstandProjectBuilder for Understand") {
        val understandProjectBuilder = UnderstandProjectBuilder('/')

        context("reading csv lines from Understand") {
            val project = understandProjectBuilder
                .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("understand.csv")!!)
                .build()

            it("project has number number of files in csv") {
                assertThat(project.size, greaterThanOrEqualTo(223))
            }

            it("leaf has file attributes") {
                val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }.distinct()
                assertThat(attributes, hasItem("rloc"))
            }

            it("leaf has class attributes") {
                val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }.distinct()
                assertThat(attributes, hasItem("max_cbo"))
            }

            it("has no nodes other than files and folders") {
                val nonFileNonFolderNodes = project.rootNode.nodes.values
                    .filter { it.type != NodeType.Folder && it.type != NodeType.File }
                assertThat(nonFileNonFolderNodes, hasSize(0))
            }

            it("has no folder nodes as leaves") {
                val folderLeaves = project.rootNode.leafObjects
                    .filter { it.type == NodeType.Folder }
                assertThat(folderLeaves, hasSize(0))
            }
        }

        context("reading csv lines from Understand with LF breaks") {
            val project = understandProjectBuilder
                .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("understand_lf.csv")!!)
                .build()

            it("project has number number of files in csv") {
                assertThat(project.size, greaterThanOrEqualTo(223))
            }
        }
    }
})
