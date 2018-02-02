package de.maibornwolff.codecharta.importer.csv

import com.google.common.collect.ImmutableMap
import org.junit.Test

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize

class CSVRowTest {

    @Test
    fun getPath_should_return_path_from_specified_path_column() {
        // given
        val name = "someNodeName"
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "path", "attrib"))
        val csvRow = arrayOf("projectName", "blubb2", "blubb3", name)

        // when
        val row = CSVRow(csvRow, header, PATH_SEPARATOR)

        // then
        assertThat(row.path, `is`(name))
    }

    @Test
    fun getFileName_should_return_filename_from_specified_path_column() {
        // given
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "Path", "attrib"))
        val nameExpectedFilenameMap = ImmutableMap.of(
                "someNodeName", "someNodeName",
                "someDir\\someName", "someName",
                "someDir\\anotherDir\\anotherName", "anotherName")

        for (name in nameExpectedFilenameMap.keys) {
            // when
            val row = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR)
            // then
            assertThat(row.fileName, `is`<String>(nameExpectedFilenameMap[name]))
        }
    }

    @Test
    @Throws(Exception::class)
    fun getFolderWithFile_should_return_folderWithFile_from_specified_path_column() {
        // given
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "PATH", "attrib"))
        val nameExpectedFolderWithFileMap = ImmutableMap.of(
                "someNodeName", "",
                "someDir\\someName", "someDir\\",
                "someDir\\anotherDir\\anotherName", "someDir\\anotherDir\\")

        for (name in nameExpectedFolderWithFileMap.keys) {
            // when
            val row = CSVRow(arrayOf("projectName", "blubb2", "blubb3", name), header, PATH_SEPARATOR)
            // then
            assertThat(row.folderWithFile, `is`<String>(nameExpectedFolderWithFileMap[name]))
        }
    }

    @Test
    @Throws(Exception::class)
    fun getAttributes_should_read_float_from_metric_column() {
        // given
        val header = CSVHeader(arrayOf("path", "attrib"))
        val rawRow = arrayOf("name", "3,2")

        // when
        val row = CSVRow(rawRow, header, PATH_SEPARATOR)

        // then
        assertThat<Set<String>>(row.attributes.keys, hasSize(1))
        assertThat<Any>(row.attributes["attrib"], `is`<Any>(3.2f))
    }

    @Test
    @Throws(Exception::class)
    fun getAttributes_should_ignore_string_in_metric_column() {
        // given
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "path", "attrib"))
        val rawRow = arrayOf("projectName", "blubb2", "blubb3", "name", "3bla")

        // when
        val row = CSVRow(rawRow, header, PATH_SEPARATOR)

        // then
        assertThat<Set<String>>(row.attributes.keys, hasSize(0))
    }

    @Test
    @Throws(Exception::class)
    fun getAttributes_should_ignore_column_if_no_attributeName_in_head() {
        // given
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "path"))
        val rawRow = arrayOf("projectName", "blubb2", "blubb3", "name", "3,0")

        // when
        val row = CSVRow(rawRow, header, PATH_SEPARATOR)

        // then
        assertThat<Set<String>>(row.attributes.keys, hasSize(0))
    }

    @Test
    @Throws(Exception::class)
    fun getAttributes_should_ignore_column_if_not_present_in_row() {
        // given
        val header = CSVHeader(arrayOf("path", "head2", "head3", "missingValueColumn"))
        val rawRow = arrayOf("somePath", "1,2", "1.3")

        // when
        val row = CSVRow(rawRow, header, PATH_SEPARATOR)

        // then
        assertThat<Set<String>>(row.attributes.keys, hasSize(2))
    }

    @Test(expected = IllegalArgumentException::class)
    fun should_throw_exception_if_no_path_column_present() {
        // given
        val header = CSVHeader(arrayOf("head1", "head2", "head3", "path"))

        // when
        CSVRow(arrayOf("", ""), header, PATH_SEPARATOR)

        // then throw
    }

    companion object {
        private const val PATH_SEPARATOR = '\\'
    }
}