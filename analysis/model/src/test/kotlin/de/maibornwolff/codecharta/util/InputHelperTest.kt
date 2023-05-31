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
                    Arguments.of(false, false),
                    Arguments.of(true, false),
                    Arguments.of(false, true),
                    Arguments.of(true, true))
        }

        @JvmStatic
        fun provideOneFlagArgument(): List<Arguments> {
            return listOf(
                    Arguments.of(false),
                    Arguments.of(true))
        }
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should output warning for all files which were not found`(canInputBePiped: Boolean, canInputContainFolders: Boolean) {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))

        val invalidFilePath1 = "src/test/resources/thisDoesNotExist1.json"
        val invalidFilePath2 = "src/test/resources/thisDoesNotExist2.json"

        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File(invalidFilePath1),
                File(invalidFilePath2))
        try {
            InputHelper.isInputValid(inputFiles, canInputBePiped, canInputContainFolders)
        } catch (exception: IllegalArgumentException) {
            // do nothing
        }

        System.setOut(originalOut)
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
                .contains("Could not find resource `$invalidFilePath1`")
        Assertions.assertThat(errContent.toString())
                .contains("Could not find resource `$invalidFilePath2`")
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should return invalid if input contains one nonexistent file`(canInputBePiped: Boolean, canInputContainFolders: Boolean) {
        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File("src/test/resources/thisDoesNotExist1.json"))

        val result = InputHelper.isInputValid(inputFiles, canInputBePiped, canInputContainFolders)

        Assertions.assertThat(result).isFalse()
    }

    @ParameterizedTest
    @MethodSource("provideOneFlagArgument")
    fun `should return invalid if no files are specified and input can not be piped`(canInputContainFolders: Boolean) {
        val inputFiles = arrayOf<File>()

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValid(inputFiles, canInputBePiped = false, canInputContainFolders)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("Did not find any input resources!")
    }

    @ParameterizedTest
    @MethodSource("provideOneFlagArgument")
    fun `should return valid if no files are specified and input can be piped`(canInputContainFolders: Boolean) {
        val inputFiles = arrayOf<File>()

        val result = InputHelper.isInputValid(inputFiles, true, canInputContainFolders)
        Assertions.assertThat(result).isTrue()
    }

    @ParameterizedTest
    @MethodSource("provideOneFlagArgument")
    fun `should return invalid if input contains existent but empty directory as input`(canInputBePiped: Boolean) {
        val emptyDirectoryPath = "src/test/resources/emptyDirectory"
        val emptyTestDirectory = File(emptyDirectoryPath)
        emptyTestDirectory.mkdir()
        emptyTestDirectory.deleteOnExit()

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValid(arrayOf(emptyTestDirectory), canInputBePiped, true)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("The specified path `${ emptyTestDirectory.path }` exists but is empty!")
    }

    @ParameterizedTest
    @MethodSource("providerParserArguments")
    fun `should return valid if input only contains existing files`(canInputBePiped: Boolean, canInputContainFolders: Boolean) {
        val validFile1 = File("src/test/resources/example.cc.json")
        val validFile2 = File("src/test/resources/example_api_version_1.3.cc.json")
        val validFile3 = File("src/test/resources/exampleUncompressed.txt")

        val inputFiles = arrayOf(validFile1, validFile2, validFile3)

        val result = InputHelper.isInputValid(inputFiles, canInputBePiped, canInputContainFolders)

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return list of all contained input files in valid directory`() {
        val validFile1 = File("src/test/resources/example.cc.json")
        val validFile2 = File("src/test/resources/example_api_version_1.3.cc.json")
        val validFile3 = File("src/test/resources/exampleUncompressed.txt")

        val inputFiles = arrayOf(validFile1, validFile2, validFile3)

        val result = InputHelper.getFileListFromValidatedResourceArray(inputFiles)

        Assertions.assertThat(validFile1)
        Assertions.assertThat(validFile2)
        Assertions.assertThat(validFile3)

        Assertions.assertThat(result.size).isEqualTo(inputFiles.size)
    }

    @Test
    fun `should return list of all input files in valid directory`() {
        val validDirectory = File("src/test/resources/inputFiles")
        val amountOfFilesInDirectory = 2

        val inputFiles = arrayOf(validDirectory)

        val result = InputHelper.getFileListFromValidatedResourceArray(inputFiles)

        Assertions.assertThat(result).contains(File("src/test/resources/inputFiles/dummyFile1.txt"))
        Assertions.assertThat(result).contains(File("src/test/resources/inputFiles/dummyFile2.txt"))

        // Subtract directory as file in list, add number of files in directory
        Assertions.assertThat(result.size).isEqualTo(amountOfFilesInDirectory)
    }

    @ParameterizedTest
    @MethodSource("provideOneFlagArgument")
    fun `should return invalid if folder is given with no-folder-flag`(canInputBePiped: Boolean) {
        val validDirectory = File("src/test/resources/inputFiles")

        val inputFiles = arrayOf(validDirectory)

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValid(inputFiles, canInputBePiped, false)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("Input folder where only files are allowed!")
    }
}
