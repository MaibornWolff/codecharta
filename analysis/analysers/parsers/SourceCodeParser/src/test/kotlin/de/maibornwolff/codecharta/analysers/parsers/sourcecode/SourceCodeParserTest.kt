package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
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
class SourceCodeParserTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err
    private val originalOut = System.out

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent.flush()
    }

    companion object {
        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                Arguments.of("src/test/resources/my/java/repo"),
                Arguments.of("src/test/resources/my/java/repo/hello_world.java"),
                Arguments.of("src/test/resources/my")
            )
        }

        @JvmStatic
        fun provideInvalidInputFiles(): List<Arguments> {
            return listOf(
                Arguments.of("src/test/resources/my/empty/repo"),
                Arguments.of("src/test/resources/this/does/not/exist"),
                Arguments.of("src/test/resources/my/non-java/repo"),
                Arguments.of("")
            )
        }
    }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `should be identified as applicable when given directory path contains a java file`(resourceToBeParsed: String) {
        // when
        val isUsable = SourceCodeParser().isApplicable(resourceToBeParsed)

        // then
        Assertions.assertThat(isUsable).isTrue()
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable when no java file is present at given path`(resourceToBeParsed: String) {
        // when
        val isUsable = SourceCodeParser().isApplicable(resourceToBeParsed)

        // then
        Assertions.assertThat(isUsable).isFalse()
    }

    @Test
    fun `should stop execution when input files are invalid`() {
        // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))

        // when
        CommandLine(SourceCodeParser()).execute("thisDoesNotExist")

        // then
        Assertions.assertThat(errContent.toString())
            .contains("Input invalid file for SourceCodeParser, stopping execution")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should log the correct absolute path of the output file when serializing a project`() {
        // given
        val inputFilePath = "src/test/resources/my/java/repo"
        val outputFilePath = "src/test/resources/output.cc.json"
        val absoluteOutputFilePath = File(outputFilePath).absolutePath
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()

        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.info(capture(lambdaSlot)) } returns Unit

        // when
        CommandLine(SourceCodeParser()).execute(inputFilePath, "-o", outputFilePath, "-nc")

        // then
        Assertions.assertThat(lambdaSlot.last()().endsWith(absoluteOutputFilePath)).isTrue()
    }

    @Test
    fun `should exclude all specified files when multiple files are specified for the exclude flag`() {
        // given
        val inputFilePath = "src/test/resources/sampleproject"
        val outputStream = ByteArrayOutputStream()
        val fileToExclude1 = "foo.java"
        val fileToExclude2 = "Java14.java"
        val exclude = listOf(fileToExclude1, fileToExclude2)

        // when
        CommandLine(SourceCodeParser(PrintStream(outputStream))).execute(inputFilePath, "--exclude", "$exclude")

        // then
        Assertions.assertThat(outputStream.toString()).doesNotContain(fileToExclude1)
        Assertions.assertThat(outputStream.toString()).doesNotContain(fileToExclude2)
    }
}
