package de.maibornwolff.codecharta.exporter.csvexporter

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CSVExporterTest {
    private var errContent = ByteArrayOutputStream()
    private val originalErr = System.err
    private var outContent = ByteArrayOutputStream()
    private val originalOut = System.out

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent = ByteArrayOutputStream()
        outContent = ByteArrayOutputStream()
    }

    @Test
    fun `should create correct output for single valid file as input source`() {
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val outputFilePath = "src/test/resources/output.csv"

        val outputFile = File(outputFilePath)
        val referenceFile = File("src/test/resources/reference_valid_1.csv")
        outputFile.deleteOnExit()

        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePath)

        Assertions.assertThat(outputFile.exists()).isTrue()
        Assertions.assertThat(outputFile.length()).isNotEqualTo(0)
        Assertions.assertThat(outputFile).hasSameTextualContentAs(referenceFile)
    }

    @Test
    fun `should create correct output for two valid files as input sources`() {
        val inputFilePath1 = "src/test/resources/input_valid_1.cc.json"
        val inputFilePath2 = "src/test/resources/input_valid_2.cc.json"
        val outputFilePath = "src/test/resources/output.csv"

        val outputFile = File(outputFilePath)
        val referenceFile = File("src/test/resources/reference_valid_1_valid_2.csv")
        outputFile.deleteOnExit()

        CommandLine(CSVExporter()).execute(inputFilePath1, inputFilePath2, "-o", outputFilePath)

        Assertions.assertThat(outputFile.exists()).isTrue()
        Assertions.assertThat(outputFile.length()).isNotEqualTo(0)
        Assertions.assertThat(outputFile).hasSameTextualContentAs(referenceFile)
    }

    @Test
    fun `should fail to create output for invalid file as input source`() {
        val invalidInputFilePath = "filePathDoesNotExist.cc.json"

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(CSVExporter()).execute(invalidInputFilePath).toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Invalid input file for CSVExporter, stopping execution...")
    }

    @Test
    fun `should fail to create output for invalid and valid file as input source`() {
        val validInputFilePath = "src/test/resources/input_valid_1.cc.json"
        val invalidInputFilePath = "filePathDoesNotExist.cc.json"

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(CSVExporter()).execute(validInputFilePath, invalidInputFilePath).toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Invalid input file for CSVExporter, stopping execution...")
    }

    @Test
    fun `should fail to create output for folder as input source`() {
        val pathToFolder = "src/test/resources/"

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(CSVExporter()).execute(pathToFolder).toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Invalid input file for CSVExporter, stopping execution...")
    }

    @Test
    fun `should write output to file when output file is missing csv extension`() {
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val outputFilePathWitExtension = "src/test/resources/output.csv"
        val outputFilePathWithoutExtension = "src/test/resources/output"

        val outputFileWithExtension = File(outputFilePathWitExtension)
        outputFileWithExtension.deleteOnExit()

        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePathWithoutExtension)
        Assertions.assertThat(outputFileWithExtension.exists()).isTrue()
        Assertions.assertThat(outputFileWithExtension.length()).isNotEqualTo(0)
    }

    @Test
    fun `should overwrite content in output file`() {
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val outputFilePath = "src/test/resources/output.csv"

        val outputFile = File(outputFilePath)
        val initialContent = "Initial content"
        outputFile.writeText(initialContent)

        val referenceFile = File("src/test/resources/reference_valid_1.csv")
        outputFile.deleteOnExit()

        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePath)

        Assertions.assertThat(outputFile.exists()).isTrue()
        Assertions.assertThat(outputFile.length()).isNotEqualTo(0)
        Assertions.assertThat(outputFile).hasSameTextualContentAs(referenceFile)
    }

    @Test
    fun `should write output to stdout when no output file specified`() {
        val inputFilePath = "../../test/data/codecharta/csvexport_input.cc.json"

        System.setOut(PrintStream(outContent))
        CommandLine(CSVExporter()).execute(inputFilePath)
        System.setOut(originalOut)

        val csvContent = outContent.toString()

        Assertions.assertThat(csvContent.isNotEmpty()).isTrue()
    }

    @Test
    fun `should write output to stdout when empty output file specified`() {
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val emptyOutputFilePath = ""

        System.setOut(PrintStream(outContent))
        CommandLine(CSVExporter()).execute(inputFilePath, "-o", emptyOutputFilePath)
        System.setOut(originalOut)

        val csvContent = outContent.toString()

        Assertions.assertThat(csvContent.isNotEmpty()).isTrue()
    }

    @Test
    fun `should create correct output for depth-of-hierarchy of five`() {
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val maxHierarchy = 5

        System.setOut(PrintStream(outContent))
        CommandLine(CSVExporter()).execute(filePath, "--depth-of-hierarchy", "$maxHierarchy")
        System.setOut(originalOut)

        val csvContent = outContent.toString()
        val firstList = csvContent.lines().first()

        val dirsZeroToFour = "dir0,dir1,dir2,dir3,dir4"
        val dirsFiveToNine = "dir[5-9]"
        Assertions.assertThat(firstList).containsPattern(dirsZeroToFour)
        Assertions.assertThat(firstList).doesNotContainPattern(dirsFiveToNine)
    }

    @Test
    fun `should create correct output for depth-of-hierarchy of zero`() {
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val maxHierarchy = 0

        System.setOut(PrintStream(outContent))
        CommandLine(CSVExporter()).execute(filePath, "--depth-of-hierarchy", "$maxHierarchy")
        System.setOut(originalOut)

        val csvContent = outContent.toString()
        val firstList = csvContent.lines().first()

        Assertions.assertThat(firstList).doesNotContainPattern("dir\\d+")
    }

    @Test
    fun `should fail to create output for negative depth-of-hierarchy`() {
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val maxHierarchy = -1
        System.setErr(PrintStream(errContent))

        CommandLine(CSVExporter()).execute(filePath, "--depth-of-hierarchy", "$maxHierarchy").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("depth-of-hierarchy must not be negative")
    }
}
