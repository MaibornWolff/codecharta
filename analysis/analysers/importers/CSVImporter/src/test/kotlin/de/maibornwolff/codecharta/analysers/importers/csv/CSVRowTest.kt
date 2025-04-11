package de.maibornwolff.codecharta.analysers.importers.csv

import de.maibornwolff.codecharta.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

private const val PATH_SEPARATOR = '\\'

class CSVRowTest {
    private val header = CSVHeader(arrayOf("head1", "head2", "head3", "path", "attrib", "attrib2", ""))

    @Test
    fun `path column header should be used as node name`() {
        val nameExpectedFilenameMap =
            mapOf(
                Pair("someNodeName", "someNodeName"),
                Pair("someDir\\someName", "someName"),
                Pair("someDir\\anotherDir\\anotherName", "anotherName")
            )

        for (name in nameExpectedFilenameMap.keys) {
            val node = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR).asNode()
            assertThat(node.name).isEqualTo(nameExpectedFilenameMap[name])
        }
    }

    @Test
    fun `path in Tree should be absolute file name from column header`() {
        val nameExpectedFolderWithFileMap =
            mapOf(
                Pair("someNodeName", Path.TRIVIAL),
                Pair("someDir\\someName", Path(listOf("someDir"))),
                Pair("someDir\\anotherDir\\anotherName", Path(listOf("someDir", "anotherDir")))
            )

        for (name in nameExpectedFolderWithFileMap.keys) {
            val path = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR).pathInTree()
            assertThat(path).isEqualTo(nameExpectedFolderWithFileMap[name])
        }
    }

    @Test
    fun `should throw exception if no path column present`() {
        assertFailsWith(IllegalArgumentException::class) {
            CSVRow(arrayOf("", ""), header, PATH_SEPARATOR)
        }
    }

    @Test
    fun `should ignore columns if no attribute name in header`() {
        val rawRow = arrayOf<String?>("1", "2", "3", "file", "4", "5", "6", "7")
        val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
        assertThat(node.attributes.keys).hasSize(5)
    }

    @Test
    fun `should ignore column if not in row`() {
        val rawRow = arrayOf<String?>("blubb1", "blubb2", "blubb3", "path")
        val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
        assertThat(node.attributes.keys).doesNotContain("attrib")
    }

    @Test
    fun `should have attribute for metric columns`() {
        val rawRow = arrayOf<String?>("3,2", "2", "3", "file")
        val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
        assertThat(node.attributes["head1"] as Double).isEqualTo(3.2)
    }

    @Test
    fun `should have NO attribute for non-metric columns`() {
        val rawRow = arrayOf<String?>("bla", "2", "3", "file")
        val node = CSVRow(rawRow, header, PATH_SEPARATOR).asNode()
        assertThat(node.attributes["head1"]).isNull()
    }
}
