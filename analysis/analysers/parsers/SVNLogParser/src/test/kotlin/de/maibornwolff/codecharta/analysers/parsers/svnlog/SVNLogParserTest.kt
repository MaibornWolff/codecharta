package de.maibornwolff.codecharta.analysers.parsers.svnlog

import de.maibornwolff.codecharta.analysers.parsers.svnlog.SVNLogParser.Companion.main
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SVNLogParserTest {
    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private fun provideInvalidInputFiles(): List<Arguments> {
        return listOf(
            Arguments.of("src/test/resources/my/empty/repo"),
            Arguments.of("src/test/resources/this/does/not/exist"),
            Arguments.of(""),
            Arguments.of("src/test/resources/my")
        )
    }

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/example_svn.log",
                "--output-file=src/test/resources/svn-analysis.cc.json",
                "--not-compressed",
                "--silent"
            )
        )
        val file = File("src/test/resources/svn-analysis.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/example_svn.log",
                "--output-file=src/test/resources/svn-analysis.cc.json"
            )
        )
        val file = File("src/test/resources/svn-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should be identified as applicable for given directory path containing a svn folder`() {
        val svnFolderParentFilePath = "src/test/resources/my/svn/repo/"
        val svnFolderFilePath = "src/test/resources/my/svn/repo/.svn"

        val testSVNDirectory = File(svnFolderFilePath)
        testSVNDirectory.mkdir()

        val isUsableFromParentFolder = SVNLogParser().isApplicable(svnFolderParentFilePath)
        val isUsableFromSVNFolder = SVNLogParser().isApplicable(svnFolderFilePath)

        Assertions.assertThat(isUsableFromParentFolder).isTrue()
        Assertions.assertThat(isUsableFromSVNFolder).isTrue()

        testSVNDirectory.delete()
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable if no svn folder is present at given path`(resourceToBeParsed: String) {
        val isUsable = SVNLogParser().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isFalse()
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(SVNLogParser()).execute("thisDoesNotExist.cc.json").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for SVNLogParser, stopping execution")
    }
}
