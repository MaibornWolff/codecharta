package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter.Companion.main
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
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

    @AfterEach
    fun unmockEverything() {
        unmockkAll()
    }

    @Test
    fun `should merge all files in a folder correctly`() {
        val projectLocation = "src/test/resources/mergeFolderTest"
        val invalidFile = "invalid.json"

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(projectLocation).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        // should ignore files starting with a dot
        assertThat(outContent.toString()).doesNotContain("ShouldNotAppear.java")

        // should warn about skipped files
        assertThat(errContent.toString()).contains(invalidFile)
    }

    @Test
    fun `should merge all indicated files`() {
        System.setOut(PrintStream(outContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json",
            "src/test/resources/mergeFolderTest/file2.cc.json"
        ).toString()
        System.setOut(originalOut)
        val valueInFile1 = "SourceMonCsvConverterTest.java"
        val valueInFile2 = "SourceMonCsvConverter.java"

        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should create json uncompressed file`() {
        val inputFile1 = "src/test/resources/test.json"
        val inputFile2 = "src/test/resources/test2.json"

        main(
            arrayOf(
                inputFile1,
                inputFile2,
                "-nc",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should merge non-overlapping json files with force`() {
        System.setOut(PrintStream(outContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderTest/file2_no_overlap.cc.json",
            "-f"
        ).toString()
        System.setOut(originalOut)
        val valueInFile1 = "JavaParserTest.java"
        val valueInFile2 = "JavaParser.java"

        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/test.json",
                "src/test/resources/test2.json",
                "-o=src/test/resources/output"
            )
        )
        val file = File("src/test/resources/output.cc.json.gz")
        file.deleteOnExit()

        assertThat(file.exists()).isTrue
    }

    @Test
    fun `should not execute merge if input is invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1.cc.json",
            "src/test/resources/thisDoesNotExist.cc.json"
        ).toString()
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution")
    }

    @Test
    fun `should warn if no top-level overlap and ask user to force merge`() {
        mockkObject(ParserDialog)
        every {
            ParserDialog.askForceMerge()
        } returns true

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderTest/file2_no_overlap.cc.json"
        ).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Warning: No top-level overlap between projects")

        val valueInFile1 = "JavaParserTest.java"
        val valueInFile2 = "JavaParser.java"
        assertThat(outContent.toString()).contains(valueInFile1)
        assertThat(outContent.toString()).contains(valueInFile2)
    }

    @Test
    fun `should cancel merge if no top-level overlap and user declines force merge`() {
        mockkObject(ParserDialog)
        every {
            ParserDialog.askForceMerge()
        } returns false

        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(
            "src/test/resources/mergeFolderTest/file1_no_overlap.cc.json",
            "src/test/resources/mergeFolderTest/file2_no_overlap.cc.json"
        ).toString()
        System.setOut(originalOut)
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Warning: No top-level overlap between projects")

        assertThat(outContent.toString()).doesNotContain("SourceMonCsvConverter.java")
    }

    @Test
    fun `should return ParserDialog when getDialog is called`() {
        val mergeFilter = MergeFilter()

        assertThat(mergeFilter.getDialog()).isSameAs(ParserDialog)
    }

    @Test
    fun `should return false for isApplicable`() {
        val mergeFilter = MergeFilter()

        assertThat(mergeFilter.isApplicable("resourceToBeParsed")).isFalse
    }

    @Test
    fun `should log error when folder path is invalid`() {
        mockkObject(ParserDialog)

        every {
            ParserDialog.getInputFileName("cc.json", true)
        } returns "invalid/folder/path"

        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute("invalid/folder/path").toString()
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
    }

    @Test
    fun `should log error when no cc json files found in folder`() {
        mockkObject(ParserDialog)

        every {
            ParserDialog.getInputFileName("cc.json", true)
        } returns "src/test/resources/emptyFolder"

        val emptyFolder = File("src/test/resources/emptyFolder")
        emptyFolder.mkdirs()
        emptyFolder.deleteOnExit()

        System.setErr(PrintStream(errContent))
        CommandLine(MergeFilter()).execute(emptyFolder.absolutePath).toString()
        System.setErr(originalErr)

        assertThat(errContent.toString()).contains("Input invalid files/folders for MergeFilter, stopping execution...")
    }
}
