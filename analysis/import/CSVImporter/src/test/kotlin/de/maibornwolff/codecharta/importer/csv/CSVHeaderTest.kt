package de.maibornwolff.codecharta.importer.csv

import com.google.common.collect.ImmutableSet
import org.junit.Test

import org.hamcrest.CoreMatchers.`is`
import org.junit.Assert.assertThat

class CSVHeaderTest {
    @Test(expected = IllegalArgumentException::class)
    fun emptyHeader_should_throw_exception() {
        CSVHeader(arrayOf())
    }

    @Test
    fun columnNumbers_should_return_all_columnNumbers() {
        val header = CSVHeader(arrayOf("first", "second"))
        assertThat(header.columnNumbers, `is`<Set<Int>>(ImmutableSet.of(0, 1)))
    }

    @Test
    fun empty_header_columns_should_be_ignored() {
        val header = CSVHeader(arrayOf("first", "second", ""))
        assertThat(header.columnNumbers, `is`<Set<Int>>(ImmutableSet.of(0, 1)))
    }

    @Test
    fun duplicate_header_columns_should_be_ignored() {
        val header = CSVHeader(arrayOf("first", "second", "first"))
        assertThat(header.columnNumbers, `is`<Set<Int>>(ImmutableSet.of(0, 1)))
    }

    @Test
    fun getColumnName_should_return_header_column() {
        val secondHeaderColumn = "second"
        val header = CSVHeader(arrayOf("first", secondHeaderColumn, "third"))
        assertThat(header.getColumnName(1), `is`(secondHeaderColumn))
    }

    @Test(expected = IllegalArgumentException::class)
    fun getColumnName_should_throw_Exception_if_no_column_present() {
        val header = CSVHeader(arrayOf("first", "second", "third"))
        header.getColumnName(4)
    }

    @Test
    fun getPathColumn_should_return_header_column_named_path() {
        val header = CSVHeader(arrayOf("first", "path", "third"))

        assertThat(header.pathColumn, `is`(1))
    }

    @Test
    fun getPathColumn_should_return_first_column_if_no_path_colum_present_and_first_column_nonempty() {
        val header = CSVHeader(arrayOf("first", "second", "third"))

        assertThat(header.pathColumn, `is`(0))
    }

    @Test
    fun getPathColumn_should_return_first_nonempty_column_if_no_path_colum_present() {
        val header = CSVHeader(arrayOf("", "second", "third"))

        assertThat(header.pathColumn, `is`(1))
    }
}