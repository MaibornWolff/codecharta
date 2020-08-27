package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.model.Path
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.CoreMatchers.hasItem
import org.hamcrest.CoreMatchers.not
import org.hamcrest.CoreMatchers.nullValue
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

private const val PATH_SEPARATOR = '\\'

class CSVRowTest : Spek({

    describe("Using a header with path column") {
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "path", "attrib", "attrib2", ""))

        it("name of node should be filename from this columnn") {
            val nameExpectedFilenameMap = mapOf(
                Pair("someNodeName", "someNodeName"),
                Pair("someDir\\someName", "someName"),
                Pair("someDir\\anotherDir\\anotherName", "anotherName")
            )

            for (name in nameExpectedFilenameMap.keys) {
                val node = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR).asNode()
                assertThat(node.name, `is`(nameExpectedFilenameMap[name]))
            }
        }

        it("path in Tree should be absolute file name from this column") {
            val nameExpectedFolderWithFileMap = mapOf(
                Pair("someNodeName", Path.TRIVIAL),
                Pair("someDir\\someName", Path(listOf("someDir"))),
                Pair("someDir\\anotherDir\\anotherName", Path(listOf("someDir", "anotherDir")))
            )

            for (name in nameExpectedFolderWithFileMap.keys) {
                val path = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR).pathInTree()
                assertThat(path, `is`<Path>(nameExpectedFolderWithFileMap[name]))
            }
        }

        it("should throw exception if no path column present") {
            assertFailsWith(IllegalArgumentException::class) {
                CSVRow(arrayOf("", ""), header, PATH_SEPARATOR)
            }
        }

        it("should ignore columns if no attribute name in header") {
            val rawRow = arrayOf<String?>("1", "2", "3", "file", "4", "5", "6", "7")
            val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
            assertThat(node.attributes.keys, hasSize(5))
        }

        it("should ignore column if not in row") {
            val rawRow = arrayOf<String?>("blubb1", "blubb2", "blubb3", "path")
            val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
            assertThat(node.attributes.keys, not(hasItem("attrib")))
        }

        it("should have attribute for metric columns") {
            val rawRow = arrayOf<String?>("3,2", "2", "3", "file")
            val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
            assertThat(node.attributes["head1"] as Double, `is`<Double>(3.2))
        }

        it("should have NO attribute for non-metric columns") {
            val rawRow = arrayOf<String?>("bla", "2", "3", "file")
            val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
            assertThat(node.attributes["head1"], nullValue())
        }
    }
})
