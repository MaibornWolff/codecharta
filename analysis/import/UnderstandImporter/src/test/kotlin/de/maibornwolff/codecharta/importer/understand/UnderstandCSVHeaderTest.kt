package de.maibornwolff.codecharta.importer.understand

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.CoreMatchers.hasItem
import org.hamcrest.CoreMatchers.hasItems
import org.hamcrest.CoreMatchers.not
import org.hamcrest.MatcherAssert.assertThat
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

class UnderstandCSVHeaderTest : Spek({
    describe("an empty header") {
        val headerLine = arrayOf<String?>()
        it("should throw exception") {
            assertFailsWith(IllegalArgumentException::class) {
                UnderstandCSVHeader(headerLine)
            }
        }
    }

    describe("an invalid header") {
        val headerLine = arrayOf("first", "second", "", null, "Kind", "Name")

        it("should throw exception") {
            assertFailsWith(IllegalArgumentException::class) {
                UnderstandCSVHeader(headerLine)
            }
        }
    }

    describe("a valid header") {
        val headerLine = arrayOf("first", "second", "", null, "Kind", "Name", "File")
        val header = UnderstandCSVHeader(headerLine)

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
                header.getColumnName(7)
            }
        }

        it("should have File column as file column") {
            assertThat(header.fileColumn, `is`(6))
        }

        it("should have Name column as name column") {
            assertThat(header.nameColumn, `is`(5))
        }

        it("should have Kind column as kind column") {
            assertThat(header.kindColumn, `is`(4))
        }
    }

    describe("a duplicate header") {
        val headerLine = arrayOf<String?>("first", "first", "Kind", "Name", "File")
        val header = UnderstandCSVHeader(headerLine)

        it("should be ignored") {
            assertThat(header.columnNumbers, hasItems(0))
            assertThat(header.getColumnName(0), `is`(headerLine[0]))
        }
    }
})
