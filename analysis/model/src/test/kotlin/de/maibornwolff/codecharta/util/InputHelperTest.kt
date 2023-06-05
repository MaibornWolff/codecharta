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
        fun provideBooleanValues(): List<Arguments> {
            return listOf(
                    Arguments.of(false),
                    Arguments.of(true))
        }
    }

    @ParameterizedTest
    @MethodSource("provideBooleanValues")
    fun `should output warning for all files which were not found`(canInputContainFolders: Boolean) {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))

        val invalidFilePath1 = "src/test/resources/thisDoesNotExist1.json"
        val invalidFilePath2 = "src/test/resources/thisDoesNotExist2.json"

        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File(invalidFilePath1),
                File(invalidFilePath2))
        try {
            InputHelper.isInputValid(inputFiles, canInputContainFolders)
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
    @MethodSource("provideBooleanValues")
    fun `should return invalid if input contains one nonexistent file`(canInputContainFolders: Boolean) {
        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File("src/test/resources/thisDoesNotExist1.json"))

        val result = InputHelper.isInputValid(inputFiles, canInputContainFolders)

        Assertions.assertThat(result).isFalse()
    }

    @ParameterizedTest
    @MethodSource("provideBooleanValues")
    fun `should return invalid if no files are specified`(canInputContainFolders: Boolean) {
        val inputFiles = arrayOf<File>()

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValid(inputFiles, canInputContainFolders)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("Did not find any input resources!")
    }

    @Test
    fun `should return invalid if input contains existent but empty directory as input`() {
        val emptyDirectoryPath = "src/test/resources/emptyDirectory"
        val emptyTestDirectory = File(emptyDirectoryPath)
        emptyTestDirectory.mkdir()
        emptyTestDirectory.deleteOnExit()

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValid(arrayOf(emptyTestDirectory), true)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("The specified path `${ emptyTestDirectory.path }` exists but is empty!")
    }

    @ParameterizedTest
    @MethodSource("provideBooleanValues")
    fun `should return valid if input only contains existing files`(canInputContainFolders: Boolean) {
        val validFile1 = File("src/test/resources/example.cc.json")
        val validFile2 = File("src/test/resources/example_api_version_1.3.cc.json")
        val validFile3 = File("src/test/resources/exampleUncompressed.txt")

        val inputFiles = arrayOf(validFile1, validFile2, validFile3)

        val result = InputHelper.isInputValid(inputFiles, canInputContainFolders)

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return valid if input contains folder with files`() {
        val validDirectory = File("src/test/resources/inputFiles")

        val inputFiles = arrayOf(validDirectory)

        val result = InputHelper.isInputValid(inputFiles, true)

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

    @Test
    fun `should return invalid if folder is given with no-folder-flag`() {
        val validDirectory = File("src/test/resources/inputFiles")

        val inputFiles = arrayOf(validDirectory)

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValid(inputFiles, false)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("Input folder where only files are allowed!")
    }

    @Test
    fun `should return invalid if input contains null elements`() {
        val nullInputFile: File? = null
        val inputFiles = arrayOf(nullInputFile)

        System.setErr(PrintStream(errContent))
        val result = InputHelper.isInputValidAndNotNull(inputFiles, false)
        System.setErr(originalErr)

        Assertions.assertThat(result).isFalse()
        Assertions.assertThat(errContent.toString())
                .contains("Input contained illegal null resource!")
    }
}
