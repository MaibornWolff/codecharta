package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter.Companion.main
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class MergeFilterTest {
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @Test
    fun `should merge all files in a folder correctly`() {
        val projectLocation = "src/test/resources/mergeFolderTest"
        val valueInFile1 = "SourceMonCsvConverterTest.java"
        val valueInFile2 = "SourceMonCsvConverter.java"
        val invalidFile = "invalid.json"

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(projectLocation).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        // should ignore files starting with a dot
        assertThat(outContent.toString()).doesNotContain("ShouldNotAppear.java")

        // should merge all valid projects in folder
        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)

        // should warn about skipped files
        assertThat(errContent.toString()).contains(invalidFile)
    }

    @Test
    fun `should merge all indicated files`() {
        System.setOut(PrintStream(outContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json", "src/test/resources/mergeFolderTest/file2.cc.json"
        ).toString()
        System.setOut(originalOut)
        val valueInFile1 = "SourceMonCsvConverterTest.java"
        val valueInFile2 = "SourceMonCsvConverter.java"

        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/test.json", "src/test/resources/test2.json", "-nc",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/test.json", "src/test/resources/test2.json",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json.gz")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }
}
