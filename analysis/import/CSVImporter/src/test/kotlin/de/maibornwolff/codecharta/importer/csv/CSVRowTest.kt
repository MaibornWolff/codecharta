package de.maibornwolff.codecharta.importer.csv

import org.hamcrest.CoreMatchers.*
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import kotlin.test.assertFailsWith

private const val PATH_SEPARATOR = '\\'

class CSVRowTest : Spek({

    describe("Using a header with path column") {
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "path", "attrib", "attrib2", ""))


        it("getPath should be path from this columnn") {
            val name = "someNodeName"
            val csvRow = arrayOf<String?>("projectName", "blubb2", "blubb3", name)
            val row = CSVRow(csvRow, header, PATH_SEPARATOR)

            assertThat(row.path, `is`(name))
        }

        it("getFileName should be filename from this columnn") {
            val nameExpectedFilenameMap = mapOf(
                    Pair("someNodeName", "someNodeName"),
                    Pair("someDir\\someName", "someName"),
                    Pair("someDir\\anotherDir\\anotherName", "anotherName")
            )

            for (name in nameExpectedFilenameMap.keys) {
                val row = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR)
                assertThat(row.fileName, `is`(nameExpectedFilenameMap[name]))
            }
        }

        it("getFolderWithFile should be absolute file name from this column") {
            val nameExpectedFolderWithFileMap = mapOf(
                    Pair("someNodeName", ""),
                    Pair("someDir\\someName", "someDir\\"),
                    Pair("someDir\\anotherDir\\anotherName", "someDir\\anotherDir\\")
            )

            for (name in nameExpectedFolderWithFileMap.keys) {
                // when
                val row = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR)
                // then
                assertThat(row.folderWithFile, `is`<String>(nameExpectedFolderWithFileMap[name]))
            }
        }

        it("should throw exception if no path column present") {
            assertFailsWith(IllegalArgumentException::class) {
                CSVRow(arrayOf("", ""), header, PATH_SEPARATOR)
            }
        }

        it("should ignore columns if no attribute name in header") {
            val rawRow = arrayOf<String?>("1", "2", "3", "file", "4", "5", "6", "7")
            val row = CSVRow(rawRow, header, PATH_SEPARATOR)
            assertThat(row.attributes.keys, hasSize(5))
        }

        it("should ignore column if not in row") {
            val rawRow = arrayOf<String?>("blubb1", "blubb2", "blubb3", "path")
            val row = CSVRow(rawRow, header, PATH_SEPARATOR)
            assertThat(row.attributes.keys, not(hasItem("attrib")))
        }

        it("should have attribute for metric columns") {
            val rawRow = arrayOf<String?>("3,2", "2", "3", "file")
            val row = CSVRow(rawRow, header, PATH_SEPARATOR)
            assertThat<Any>(row.attributes["head1"], `is`<Any>(3.2f))
        }

        it("should have NO attribute for non-metric columns") {
            val rawRow = arrayOf<String?>("bla", "2", "3", "file")
            val row = CSVRow(rawRow, header, PATH_SEPARATOR)
            assertThat(row.attributes["head1"], nullValue())
        }
    }
})