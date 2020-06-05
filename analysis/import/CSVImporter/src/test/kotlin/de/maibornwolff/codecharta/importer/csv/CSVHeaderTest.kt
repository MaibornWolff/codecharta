package de.maibornwolff.codecharta.importer.csv

import org.hamcrest.CoreMatchers.* // ktlint-disable no-wildcard-imports
import org.hamcrest.MatcherAssert.assertThat
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

class CSVHeaderTest : Spek({
    describe("an empty header") {
        it("should throw exception") {
            assertFailsWith(IllegalArgumentException::class) {
                CSVHeader(arrayOf())
            }
        }
    }

    describe("a valid header") {
        val headerLine = arrayOf("first", "second", "", null)
        val header = CSVHeader(headerLine)

        it("should have non-empty columns") {
            assertThat(header.columnNumbers, hasItems(0, 1))
            assertThat(header.getColumnName(0), `is`(headerLine[0]))
            assertThat(header.getColumnName(1), `is`(headerLine[1]))
        }

        it("should ignore empty columns") {
            assertThat(header.columnNumbers, not(hasItem(2)))
        }

        it("should ignore null columns") {
            assertThat(header.columnNumbers, not(hasItem(3)))
        }

        it("getColumnName should throw exception if column name not present") {
            assertFailsWith(IllegalArgumentException::class) {
                header.getColumnName(4)
            }
        }

        it("getPathColumn should return first column if no path column present and first column non empty") {
            assertThat(header.pathColumn, `is`(0))
        }
    }

    describe("a duplicate header") {
        val headerLine = arrayOf<String?>("first", "first")
        val header = CSVHeader(headerLine)

        it("should be ignored") {
            assertThat(header.columnNumbers, hasItems(0))
            assertThat(header.getColumnName(0), `is`(headerLine[0]))
        }
    }

    describe("a header with column with name path") {
        val header = CSVHeader(arrayOf("first", "path", "third"))

        it("should have this column as path column") {
            assertThat(header.pathColumn, `is`(1))
        }
    }

    describe("a header without path column and empty first column") {
        val header = CSVHeader(arrayOf("", null, "second", "third"))

        it("should have first non-empty column as path column") {
            assertThat(header.pathColumn, `is`(2))
        }
    }
})