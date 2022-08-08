package de.maibornwolff.codecharta.rawtextparser

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.parser.rawtextparser.ProjectGenerator
import de.maibornwolff.codecharta.parser.rawtextparser.model.FileMetrics
import de.maibornwolff.codecharta.serialization.OutputFileHandler
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class ProjectGeneratorTest {

    private val output: PrintStream = System.out

    @Test
    fun `file hierarchy and metrics are stored correctly`() {
        val expectedResultFile = "src/test/resources/cc_projects/project_1.cc.json"
        val metricsMap = mutableMapOf<String, FileMetrics>()
        metricsMap["bar/FooBar.java"] = FileMetrics().addMetric("foo", 0).addMetric("bar", 18)
        metricsMap["foo.java"] = FileMetrics().addMetric("barx", 42)
        val result = ByteArrayOutputStream()

        val project = ProjectGenerator().generate(metricsMap, null)
        val resultFrom = ProjectSerializer.serializeProject(project!!, OutputFileHandler.writer(expectedResultFile ?: "", output))

        val resultJSON = JsonParser().parse(result.toString())
        val expectedJson = JsonParser().parse(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `piped project is merged`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_2.cc.json").absoluteFile
        val pipedProject = ProjectDeserializer.deserializeProject(File("src/test/resources/cc_projects/project_1.cc.json").inputStream())
        val metricsMap = mutableMapOf<String, FileMetrics>()
        metricsMap["foo.java"] = FileMetrics().addMetric("bar", 18)
        val result = ByteArrayOutputStream()

//        ProjectGenerator(OutputStreamWriter(PrintStream(result)), expectedResultFile.absolutePath, false).generate(metricsMap, pipedProject)

        val resultJSON = JsonParser().parse(result.toString())
        val expectedJson = JsonParser().parse(expectedResultFile.reader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }
}
