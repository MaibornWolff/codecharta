package de.maibornwolff.codecharta.analysers.importers.csv

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class CSVHeaderTest {
    @Test
    fun `an empty header should throw exception`() {
        assertFailsWith(IllegalArgumentException::class) {
            CSVHeader(arrayOf())
        }
    }

    @Test
    fun `a valid header should have non-empty columns`() {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)
        header.columnNumbers.containsAll(listOf(0, 1))
        assertThat(header.columnNumbers).containsAll(listOf(0, 1))
        assertThat(header.getColumnName(0)).isEqualTo(headerLine[0])
        assertThat(header.getColumnName(1)).isEqualTo(headerLine[1])
    }

    @Test
    fun `a valid header should ignore empty columns`() {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)
        assertThat(header.columnNumbers).doesNotContain(2)
    }

    @Test
    fun `a valid header should ignore null columns`() {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)
        assertThat(header.columnNumbers).doesNotContain(3)
    }

    @Test
    fun `a valid header getColumnName should throw exception if column name not present`() {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)
        assertFailsWith(IllegalArgumentException::class) {
            header.getColumnName(4)
        }
    }

    @Test
    fun `getPathColumn should return first column if no path column present and first column non empty`() {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)
        assertThat(header.pathColumn).isEqualTo(0)
    }

    @Test
    fun `a duplicate header should be ignored`() {
        val headerLine = arrayOf<String?>("first", "first")
        val header = CSVHeader(headerLine)
        assertThat(header.columnNumbers).contains(0)
        assertThat(header.getColumnName(0)).isEqualTo(headerLine[0])
    }

    @Test
    fun `a header with column with name path should have this column as path column`() {
        val header = CSVHeader(arrayOf("first", "path", "third"))
        assertThat(header.pathColumn).isEqualTo(1)
    }

    @Test
    fun `a header without path column and empty first column should have first non-empty column as path column`() {
        val header = CSVHeader(arrayOf("", null, "second", "third"))
        assertThat(header.pathColumn).isEqualTo(2)
    }
}
