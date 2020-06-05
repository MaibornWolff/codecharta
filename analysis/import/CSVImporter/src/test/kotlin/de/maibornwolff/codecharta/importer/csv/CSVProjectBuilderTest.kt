package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.nio.charset.StandardCharsets

class CSVProjectBuilderTest: Spek({
    fun toInputStream(content: String): InputStream {
        return ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
    }

    describe("a CSVProjectBuilder") {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')

        context("adding invalid csv") {

            val invalidContent = "head,path\nnoValidContent\n"
            val project = csvProjectBuilder
                    .parseCSVStream(toInputStream(invalidContent))
                    .build()

            it("should be ignored") {
                assertThat(project.rootNode.children, hasSize(0))
            }
        }

        context("adding valid csv with usual line breaks") {
            val name = "someName"
            val project = csvProjectBuilder.parseCSVStream(
                    toInputStream("someContent,,path\nprojectName,blubb2,$name")
            )
                    .build()

            it("should have node with same name") {
                assertThat(project.rootNode.children.map { it.name }, hasItem(name))
            }
        }

        context("adding valid csv with windows line breaks") {
            val name = "someName"
            val project = csvProjectBuilder.parseCSVStream(
                    toInputStream("someContent,,path\r\nprojectName,blubb2,$name")
            )
                    .build()

            it("should have node with same name") {
                assertThat(project.rootNode.children.map { it.name }, hasItem(name))
            }
        }

    }

    describe("a CSVProjectBuilder") {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')

        context("adding line with metric values") {
            val attribName = "attname"
            val attribVal = "\"0,1\""
            val attValFloat = 0.1

            val project = csvProjectBuilder.parseCSVStream(
                    toInputStream(
                            "head1,path,head3,head4,$attribName\nprojectName,\"9900,01\",\"blubb\",1.0,$attribVal\n")
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
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')

        context("adding file with subdirectory") {
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
        val csvProjectBuilder = CSVProjectBuilder('\\', ',',
                metricNameTranslator = MetricNameTranslator(mapOf(Pair("File Name", "path"))))

        context("reading csv lines from Sourcemonitor") {
            val project = csvProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("sourcemonitor.csv"))
                    .build()

            it("has correct number of nodes") {
                assertThat(project.size, `is`(39))
            }
        }
    }
})