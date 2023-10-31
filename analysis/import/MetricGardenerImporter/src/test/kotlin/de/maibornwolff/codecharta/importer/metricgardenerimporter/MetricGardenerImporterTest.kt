package de.maibornwolff.codecharta.importer.metricgardenerimporter

import de.maibornwolff.codecharta.importer.metricgardenerimporter.MetricGardenerImporter.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkConstructor
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
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
class MetricGardenerImporterTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    companion object {
        @JvmStatic
        fun provideValidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/my/supported-multi-language/repo"),
                    Arguments.of("src/test/resources/my/supported-multi-language/repo/dummyFile.js"),
                    Arguments.of("src/test/resources/my"))
        }

        @JvmStatic
        fun provideInvalidInputFiles(): List<Arguments> {
            return listOf(
                    Arguments.of("src/test/resources/my/empty/repo"),
                    Arguments.of("src/test/resources/this/does/not/exist"),
                    Arguments.of("src/test/resources/my/non-supported-language/repo"),
                    Arguments.of(""))
        }
    }

    @Test
    fun `should create json uncompressed file with attribute Descriptors`() {
        main(
            arrayOf(
                "--is-json-file", "src/test/resources/metricgardener-analysis.json", "-nc",
                "-o=src/test/resources/import-result"
            )
        )
        val file = File("src/test/resources/import-result.cc.json")
        file.deleteOnExit()
        val inputStream = file.inputStream()
        val project = ProjectDeserializer.deserializeProject(inputStream)
        inputStream.close()

        // then
        assertTrue(file.exists())
        assertEquals(project.attributeDescriptors["rloc"], getAttributeDescriptors()["real_lines_of_code"])
        assertEquals(project.attributeDescriptors["loc"], getAttributeDescriptors()["lines_of_code"])
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "--is-json-file", "src/test/resources/metricgardener-analysis.json",
                "-o=src/test/resources/import-result"
            )
        )
        val file = File("src/test/resources/import-result.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create file when MG needs to run first`() {
        main(
            arrayOf(
                "src/test/resources/MetricGardenerRawFile.kt", "-nc",
                "-o=src/test/resources/import-result-mg"
            )
        )
        val file = File("src/test/resources/import-result-mg.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create no file when the input file was not specified`() {
        main(
            arrayOf(
                "-o=src/test/resources/import-result-empty.json"
            )
        )
        val file = File("src/test/resources/import-result-empty.cc.json.gz")
        file.deleteOnExit()
        CommandLine(MetricGardenerImporter()).execute()
        assertFalse(file.exists())
    }

    @ParameterizedTest
    @MethodSource("provideValidInputFiles")
    fun `should be identified as applicable for given directory path containing a file of a supported language`(resourceToBeParsed: String) {
        val isUsable = MetricGardenerImporter().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isTrue()
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable if no file of a supported language is present at given path`(resourceToBeParsed: String) {
        val isUsable = MetricGardenerImporter().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isFalse()
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(MetricGardenerImporter()).execute("thisDoesNotExist").toString()
        System.setErr(originalErr)

        Assertions.assertThat(errContent.toString()).contains("Input invalid file for MetricGardenerImporter, stopping execution")
    }

    @Test
    fun `should stop execution if error happens while executing metric gardener`() {
        val npm = if (System.getProperty("os.name").contains("win", ignoreCase = true)) "npm.cmd" else "npm"
        val metricGardenerInvalidCommand = listOf(
                npm, "exec", "metric-gardener",
                "--", "parse", "this/path/is/invalid", "-o", "MGout.json"
        )
        val metricGardenerInvalidInputProcess = ProcessBuilder(metricGardenerInvalidCommand)
        mockkConstructor(ProcessBuilder::class)
        every { anyConstructed<ProcessBuilder>().start().waitFor() } returns metricGardenerInvalidInputProcess
                .redirectError(ProcessBuilder.Redirect.DISCARD)
                .start()
                .waitFor()

        System.setErr(PrintStream(errContent))
        CommandLine(MetricGardenerImporter()).execute("src").toString()
        System.setErr(originalErr)
        Assertions.assertThat(errContent.toString()).contains("Error while executing metric gardener! Process returned with status")
    }
}
