package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class InputHelperTest {
    val outContent = ByteArrayOutputStream()
    val originalOut = System.out
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @Test
    fun `should output warning for all files from parameters which were not found`() {
        System.setOut(PrintStream(outContent))
        System.setErr(PrintStream(errContent))

        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File("src/test/resources/thisDoesNotExist1.json"),
                File("src/test/resources/thisDoesNotExist2.json"))
        InputHelper.getAndCheckAllSpecifiedInputFiles(inputFiles)

        System.setOut(originalOut)
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString())
                .contains("Could not find file `src/test/resources/thisDoesNotExist1.json` and did not merge!")
        Assertions.assertThat(errContent.toString())
                .contains("Could not find file `src/test/resources/thisDoesNotExist2.json` and did not merge!")
    }

    @Test
    fun `should return empty list if input contains one nonexistent file`() {
        val inputFiles = arrayOf(File("src/test/resources/example.cc.json"),
                File("src/test/resources/example_api_version_1.3.cc.json"),
                File("src/test/resources/thisDoesNotExist1.json"))

        val result = InputHelper.getAndCheckAllSpecifiedInputFiles(inputFiles)

        Assertions.assertThat(result).isEmpty()
    }

    @Test
    fun `should return list of all input files if all exist`() {
        val validFile1 = File("src/test/resources/example.cc.json")
        val validFile2 = File("src/test/resources/example_api_version_1.3.cc.json")
        val validFile3 = File("src/test/resources/exampleUncompressed.txt")

        val inputFiles = arrayOf(validFile1, validFile2, validFile3)

        val result = InputHelper.getAndCheckAllSpecifiedInputFiles(inputFiles)

        Assertions.assertThat(result).contains(validFile1)
        Assertions.assertThat(result).contains(validFile2)
        Assertions.assertThat(result).contains(validFile3)

        Assertions.assertThat(result.size).isEqualTo(inputFiles.size)
    }
}
