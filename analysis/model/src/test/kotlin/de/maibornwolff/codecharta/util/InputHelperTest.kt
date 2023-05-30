package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class InputHelperTest {
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    companion object {
        @JvmStatic
        fun providerParserArguments(): List<Arguments> {
            return listOf(
                    Arguments.of(false),
                    Arguments.of(true))
        }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should output warning for all files which were not found`(canInputBePiped: Boolean) {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))

        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File("src/test/resources/thisDoesNotExist1.json"),
                File("src/test/resources/thisDoesNotExist2.json"))
        try {
            InputHelper.getInputFileListIfValid(inputFiles, canInputBePiped)
        } catch (exception: IllegalArgumentException) {
            // do nothing
        }

        System.setOut(originalOut)
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
                .contains("thisDoesNotExist1.json` and did not merge!")
        Assertions.assertThat(errContent.toString())
                .contains("thisDoesNotExist2.json` and did not merge!")
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should throw exception if input contains one nonexistent file`(canInputBePiped: Boolean) {
        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File("src/test/resources/thisDoesNotExist1.json"))

        Assertions.assertThatIllegalArgumentException().isThrownBy { InputHelper.getInputFileListIfValid(inputFiles, canInputBePiped) }
    }

    @Test
    fun `should throw exception if no files are specified and input can not be piped`() {
        val inputFiles = arrayOf<File>()

        System.setErr(PrintStream(errContent))
        Assertions.assertThatIllegalArgumentException()
                .isThrownBy { InputHelper.getInputFileListIfValid(inputFiles, false) }
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
                .contains("Did not find any input files!")
    }

    @Test
    fun `should throw no exception if no files are specified and input can be piped`() {
        val inputFiles = arrayOf<File>()

        Assertions.assertThatNoException()
                .isThrownBy { InputHelper.getInputFileListIfValid(inputFiles, true) }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should throw exception if input contains existent but empty directory as input`(canInputBePiped: Boolean) {
        val emptyDirectoryPath = "src/test/resources/emptyDirectory"
        val emptyTestDirectory = File(emptyDirectoryPath)
        emptyTestDirectory.mkdir()
        emptyTestDirectory.deleteOnExit()

        System.setErr(PrintStream(errContent))
        Assertions.assertThatIllegalArgumentException()
                .isThrownBy { InputHelper.getInputFileListIfValid(arrayOf(emptyTestDirectory), false) }
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
                .contains("The specified path `${ emptyTestDirectory.path }` exists but is empty!")
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should return list of all input files if input is valid`(canInputBePiped: Boolean) {
        val validFile1 = File("src/test/resources/example.cc.json")
        val validFile2 = File("src/test/resources/example_api_version_1.3.cc.json")
        val validFile3 = File("src/test/resources/exampleUncompressed.txt")
        val validDirectory = File("src/test/resources/inputFiles")
        val amountOfFilesInDirectory = 2

        val inputFiles = arrayOf(validFile1, validFile2, validFile3, validDirectory)

        val result = InputHelper.getInputFileListIfValid(inputFiles, canInputBePiped)

        Assertions.assertThat(result).contains(validFile1)
        Assertions.assertThat(result).contains(validFile2)
        Assertions.assertThat(result).contains(validFile3)
        Assertions.assertThat(result).contains(File("src/test/resources/inputFiles/dummyFile1.txt"))
        Assertions.assertThat(result).contains(File("src/test/resources/inputFiles/dummyFile2.txt"))

        // Subtract directory as file in list, add number of files in directory
        Assertions.assertThat(result.size).isEqualTo(inputFiles.size - 1 + amountOfFilesInDirectory)
    }
}
