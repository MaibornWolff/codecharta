package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.nio.charset.StandardCharsets

class ProjectCreatorTest : Spek({
    fun toInputStream(content: String): InputStream {
        return ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
    }

    describe("a ProjectCreator") {
        val projectCreator = ProjectCreator("test", '\\', ',')

        on("adding invalid csv") {

            val invalidContent = "head,path\nnoValidContent\n"
            val project = projectCreator.createFromCsvStream(toInputStream(invalidContent))

            it("should be ignored") {
                assertThat(project.rootNode.children, hasSize(0))
            }
        }

        on("adding valid csv") {
            val name = "someName"
            val project = projectCreator.createFromCsvStream(
                    toInputStream("someContent,,path\nprojectName,blubb2,$name")
            )

            it("should have node with same name") {
                assertThat(project.rootNode.children.map { it.name }, hasItem(name))
            }
        }

        on("adding same line twice") {
            val name = "someNameOrOther"
            val project = projectCreator.createFromCsvStream(
                    listOf(
                            toInputStream("someContent\n$name"),
                            toInputStream("someContent\n$name")
                    )
            )

            it("should add only first line") {
                assertThat(project.rootNode.children.filter { it.name == name }.size, `is`(1))
            }
        }
    }

    describe("a ProjectCreator") {
        val projectCreator = ProjectCreator("test", '\\', ',')

        on("adding line with metric values") {
            val attribName = "attname"
            val attribVal = "\"0,1\""
            val attValFloat = 0.1f

            val project = projectCreator.createFromCsvStream(
                    toInputStream("head1,path,head3,head4,$attribName\nprojectName,\"9900,01\",\"blubb\",1.0,$attribVal\n")
            )

            it("should add attributes to node") {
                val nodeAttributes = project.rootNode.children.iterator().next().attributes
                assertThat(nodeAttributes.size, `is`(3))
                assertThat<Any>(nodeAttributes[attribName], `is`<Any>(attValFloat))
            }
        }

    }

    describe("a ProjectCreator") {
        val projectCreator = ProjectCreator("test", '\\', ',')

        on("adding file with subdirectory") {
            val directoryName = "someNodeName"
            val project = projectCreator.createFromCsvStream(toInputStream("someContent\n$directoryName\\someFile"))

            it("should create node for subdirectory") {
                assertThat(project.rootNode.children.size, `is`(1))
                val node = project.rootNode.children.iterator().next()
                assertThat(node.name, `is`(directoryName))
                assertThat(node.children.size, `is`(1))
            }
        }
    }

    describe("ProjectCreator for Sourcemonitor") {
        val projectCreator = ProjectCreator("test", '\\', ',',
                MetricNameTranslator(mapOf(Pair("File Name", "path"))))

        on("reading csv lines from Sourcemonitor") {
            val project = projectCreator.createFromCsvStream(this.javaClass.classLoader.getResourceAsStream("sourcemonitor.csv"))

            it("has correct number of nodes") {
                assertThat(project.rootNode.nodes.size, greaterThan(1))
                assertThat(project.rootNode.leafObjects.size, `is`(39))
            }
        }
    }
})