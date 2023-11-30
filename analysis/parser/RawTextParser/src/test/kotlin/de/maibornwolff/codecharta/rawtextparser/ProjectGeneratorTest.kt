package de.maibornwolff.codecharta.rawtextparser

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.parser.rawtextparser.FileMetrics
import de.maibornwolff.codecharta.parser.rawtextparser.ProjectGenerator
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class ProjectGeneratorTest {

    @Test
    fun `file hierarchy and metrics are stored correctly`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_1.cc.json")
        val metricsMap = mutableMapOf<String, FileMetrics>()
        metricsMap["bar/FooBar.java"] = FileMetrics().addMetric("foo", 0).addMetric("bar", 18)
        metricsMap["foo.java"] = FileMetrics().addMetric("barx", 42)

        val project = ProjectGenerator().generate(metricsMap, null)
        val resultFromGenerator = ProjectSerializer.serializeToString(project)

        val resultJSON = JsonParser.parseString(resultFromGenerator)
        val expectedJson = JsonParser.parseReader(expectedResultFile.bufferedReader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `piped project is merged`() {
        val expectedResultFile = File("src/test/resources/cc_projects/project_2.cc.json").absoluteFile
        val pipedProject = ProjectDeserializer.deserializeProject(File("src/test/resources/cc_projects/project_1.cc.json").inputStream())
        val metricsMap = mutableMapOf<String, FileMetrics>()
        metricsMap["foo.java"] = FileMetrics().addMetric("bar", 18)

        val project = ProjectGenerator().generate(metricsMap, pipedProject)
        val resultFromGenerator = ProjectSerializer.serializeToString(project)

        val resultJSON = JsonParser.parseString(resultFromGenerator)
        val expectedJson = JsonParser.parseReader(expectedResultFile.bufferedReader())
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }
}
