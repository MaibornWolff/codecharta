package de.maibornwolff.codecharta.exporter.csvexporter

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.unmockkAll
import io.mockk.verify
import mu.KLogger
import mu.KotlinLogging
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
    fun `should create correct output when single valid file is specified as input source`() {
        // given
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val outputFilePath = "src/test/resources/output.csv"
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()
        val referenceFile = File("src/test/resources/reference_valid_1.csv")

        // when
        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePath)

        // then
        Assertions.assertThat(outputFile.exists()).isTrue()
        Assertions.assertThat(outputFile.length()).isNotEqualTo(0)
        Assertions.assertThat(outputFile).hasSameTextualContentAs(referenceFile)
    }

    @Test
    fun `should create correct output when two valid files are specified as input sources`() {
        // given
        val inputFilePath1 = "src/test/resources/input_valid_1.cc.json"
        val inputFilePath2 = "src/test/resources/input_valid_2.cc.json"
        val outputFilePath = "src/test/resources/output.csv"
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()
        val referenceFile = File("src/test/resources/reference_valid_1_valid_2.csv")

        // when
        CommandLine(CSVExporter()).execute(inputFilePath1, inputFilePath2, "-o", outputFilePath)

        // then
        Assertions.assertThat(outputFile.exists()).isTrue()
        Assertions.assertThat(outputFile.length()).isNotEqualTo(0)
        Assertions.assertThat(outputFile).hasSameTextualContentAs(referenceFile)
    }

    @Test
    fun `should fail to create output when invalid file is specified as input source`() {
        // given
        val invalidInputFilePath = "filePathDoesNotExist.cc.json"
        System.setErr(PrintStream(errContent))

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        // when
        CommandLine(CSVExporter()).execute(invalidInputFilePath)

        // then
        Assertions.assertThat(errContent.toString()).contains("Invalid input file for CSVExporter, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should fail to create output when an invalid and valid file are specified as input sources`() {
        // given
        val validInputFilePath = "src/test/resources/input_valid_1.cc.json"
        val invalidInputFilePath = "filePathDoesNotExist.cc.json"
        System.setErr(PrintStream(errContent))

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        // when
        CommandLine(CSVExporter()).execute(validInputFilePath, invalidInputFilePath)

        // then
        Assertions.assertThat(errContent.toString()).contains("Invalid input file for CSVExporter, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should fail with invalid input file error-message when path folder is specified as input`() {
        // given
        val pathToFolder = "src/test/resources/"
        System.setErr(PrintStream(errContent))

        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        // when
        CommandLine(CSVExporter()).execute(pathToFolder).toString()

        // then
        Assertions.assertThat(errContent.toString()).contains("Invalid input file for CSVExporter, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should correct output-file-extension when output file is missing csv extension`() {
        // given
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val outputFilePathWitExtension = "src/test/resources/output.csv"
        val outputFilePathWithoutExtension = "src/test/resources/output"
        val outputFileWithExtension = File(outputFilePathWitExtension)
        outputFileWithExtension.deleteOnExit()

        // when
        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePathWithoutExtension)

        // then
        Assertions.assertThat(outputFileWithExtension.exists()).isTrue()
        Assertions.assertThat(outputFileWithExtension.length()).isNotEqualTo(0)
    }

    @Test
    fun `should overwrite content in the output file when the specified output file already contains content`() {
        // given
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val outputFilePath = "src/test/resources/output.csv"
        val outputFile = File(outputFilePath)
        val initialContent = "Initial content"
        outputFile.writeText(initialContent)
        outputFile.deleteOnExit()
        val referenceFile = File("src/test/resources/reference_valid_1.csv")

        // when
        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePath)

        // then
        Assertions.assertThat(outputFile.exists()).isTrue()
        Assertions.assertThat(outputFile.length()).isNotEqualTo(0)
        Assertions.assertThat(outputFile).hasSameTextualContentAs(referenceFile)
    }

    @Test
    fun `should write output to stdout when no output file specified`() {
        // given
        val inputFilePath = "../../test/data/codecharta/csvexport_input.cc.json"
        System.setOut(PrintStream(outContent))

        // when
        CommandLine(CSVExporter()).execute(inputFilePath)
        val csvContent = outContent.toString()

        // then
        Assertions.assertThat(csvContent.isNotEmpty()).isTrue()

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should write output to stdout when empty output file specified`() {
        // given
        val inputFilePath = "src/test/resources/input_valid_1.cc.json"
        val emptyOutputFilePath = ""
        System.setOut(PrintStream(outContent))

        // when
        CommandLine(CSVExporter()).execute(inputFilePath, "-o", emptyOutputFilePath)
        val csvContent = outContent.toString()

        // then
        Assertions.assertThat(csvContent.isNotEmpty()).isTrue()

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should create correct output when depth-of-hierarchy is five`() {
        // given
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val maxHierarchy = 5
        val dirsZeroToFour = "dir0,dir1,dir2,dir3,dir4"
        val dirsFiveToNine = "dir[5-9]"
        System.setOut(PrintStream(outContent))

        // when
        CommandLine(CSVExporter()).execute(filePath, "--depth-of-hierarchy", "$maxHierarchy")
        val csvContent = outContent.toString()
        val firstList = csvContent.lines().first()

        // then
        Assertions.assertThat(firstList).containsPattern(dirsZeroToFour)
        Assertions.assertThat(firstList).doesNotContainPattern(dirsFiveToNine)

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should create correct output when depth-of-hierarchy is zero`() {
        // given
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val maxHierarchy = 0
        System.setOut(PrintStream(outContent))

        // when
        CommandLine(CSVExporter()).execute(filePath, "--depth-of-hierarchy", "$maxHierarchy")
        val csvContent = outContent.toString()
        val firstList = csvContent.lines().first()

        // then
        Assertions.assertThat(firstList).doesNotContainPattern("dir\\d+")

        // clean up
        System.setOut(originalOut)
    }

    @Test
    fun `should fail to create output when depth-of-hierarchy is negative`() {
        // given
        val filePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val maxHierarchy = -1
        System.setErr(PrintStream(errContent))

        // when
        CommandLine(CSVExporter()).execute(filePath, "--depth-of-hierarchy", "$maxHierarchy")

        // then
        Assertions.assertThat(errContent.toString()).contains("depth-of-hierarchy must not be negative")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should log the correct absolute path when output file is specified`() {
        // given
        val inputFilePath = "../../test/data/codecharta/csvexport_input.cc.json"
        val outputFilePath = "src/test/resources/output.csv"
        val absoluteOutputFilePath = File(outputFilePath).absolutePath
        val outputFile = File(outputFilePath)
        outputFile.deleteOnExit()

        val loggerMock = mockk<KLogger>()
        val infoMessagesLogged = mutableListOf<String>()
        mockkObject(KotlinLogging)
        every { KotlinLogging.logger(any<(() -> Unit)>()) } returns loggerMock
        every { loggerMock.info(capture(infoMessagesLogged)) } returns Unit

        // when
        CommandLine(CSVExporter()).execute(inputFilePath, "-o", outputFilePath)

        // then
        verify { loggerMock.info(any<String>()) }
        Assertions.assertThat(infoMessagesLogged.any { e -> e.contains(absoluteOutputFilePath) }).isTrue()
    }
}
