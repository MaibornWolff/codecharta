package de.maibornwolff.codecharta.filter.mergefilter

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.not
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class MergeFilterTest : Spek({
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err
    describe("merge filter test") {

        context("merging a folder") {
            val projectLocation = "src/test/resources/mergeFolderTest"
            val valueInFile1 = "SourceMonCsvConverterTest.java"
            val valueInFile2 = "SourceMonCsvConverter.java"
            val invalidFile = "invalid.json"

            System.setOut(PrintStream(outContent))
            System.setErr(PrintStream(errContent))
            MergeFilter.main(arrayOf(projectLocation)).toString()
            System.setOut(originalOut)
            System.setErr(originalErr)

            it("should ignore files starting with a dot") {
                assertThat(outContent.toString(), not(containsString("ShouldNotAppear.java")))
            }

            it("should merge all valid projects in folder") {
                assertThat(outContent.toString(), containsString(valueInFile1))
                assertThat(outContent.toString(), containsString(valueInFile2))
            }

            it("should warn about skipped files") {
                assertThat(errContent.toString(), containsString(invalidFile))
            }
        }

        context("merging files") {
            System.setOut(PrintStream(outContent))
            MergeFilter.main(
                arrayOf(
                    "src/test/resources/mergeFolderTest/file1.cc.json",
                    "src/test/resources/mergeFolderTest/file2.cc.json"
                )
            ).toString()
            System.setOut(originalOut)
            val valueInFile1 = "SourceMonCsvConverterTest.java"
            val valueInFile2 = "SourceMonCsvConverter.java"

            it("should merge all indicated files") {
                assertThat(outContent.toString(), containsString(valueInFile1))
                assertThat(outContent.toString(), containsString(valueInFile2))
            }
        }
    }
})
