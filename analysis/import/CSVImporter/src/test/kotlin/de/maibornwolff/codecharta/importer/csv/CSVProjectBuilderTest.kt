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

class CSVProjectBuilderTest : Spek({
    fun toInputStream(content: String): InputStream {
        return ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
    }

    describe("a CSVProjectBuilder") {
        val csvProjectBuilder = CSVProjectBuilder("test", '\\', ',')

        on("adding invalid csv") {

            val invalidContent = "head,path\nnoValidContent\n"
            val project = csvProjectBuilder
                    .parseCSVStream(toInputStream(invalidContent))
                    .build()

            it("should be ignored") {
                assertThat(project.rootNode.children, hasSize(0))
            }
        }

        on("adding valid csv") {
            val name = "someName"
            val project = csvProjectBuilder.parseCSVStream(
                    toInputStream("someContent,,path\nprojectName,blubb2,$name")
            )
                    .build()

            it("should have node with same name") {
                assertThat(project.rootNode.children.map { it.name }, hasItem(name))
            }
        }
    }

    describe("a CSVProjectBuilder") {
        val csvProjectBuilder = CSVProjectBuilder("test", '\\', ',')

        on("adding line with metric values") {
            val attribName = "attname"
            val attribVal = "\"0,1\""
            val attValFloat = 0.1f

            val project = csvProjectBuilder.parseCSVStream(
                    toInputStream("head1,path,head3,head4,$attribName\nprojectName,\"9900,01\",\"blubb\",1.0,$attribVal\n")
            )
                    .build()

            it("should add attributes to node") {
                val nodeAttributes = project.rootNode.children.iterator().next().attributes
                assertThat(nodeAttributes.size, `is`(3))
                assertThat<Any>(nodeAttributes[attribName], `is`<Any>(attValFloat))
            }
        }

    }

    describe("a CSVProjectBuilder") {
        val csvProjectBuilder = CSVProjectBuilder("test", '\\', ',')

        on("adding file with subdirectory") {
            val directoryName = "someNodeName"
            val project = csvProjectBuilder
                    .parseCSVStream(toInputStream("someContent\n$directoryName\\someFile"))
                    .build()

            it("should create node for subdirectory") {
                assertThat(project.rootNode.children.size, `is`(1))
                val node = project.rootNode.children.iterator().next()
                assertThat(node.name, `is`(directoryName))
                assertThat(node.children.size, `is`(1))
            }
        }
    }

    describe("CSVProjectBuilder for Sourcemonitor") {
        val csvProjectBuilder = CSVProjectBuilder("test", '\\', ',',
                MetricNameTranslator(mapOf(Pair("File Name", "path"))))

        on("reading csv lines from Sourcemonitor") {
            val project = csvProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("sourcemonitor.csv"))
                    .build()

            it("has correct number of nodes") {
                assertThat(project.size, `is`(39))
            }
        }
    }
})