package de.maibornwolff.codecharta.analysers.parsers.rawtext

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import java.io.File

class ProjectGeneratorTest {
    @Test
    fun `Should store file hierarchy and metrics correctly when multiple file-metrics given`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_1.cc.json")
        val expectedJson = JsonParser.parseReader(expectedResultFile.bufferedReader())
        val filePathOne = "bar/FooBar.java"
        val fileMetricsOne =
            FileMetrics()
                .addMetric("foo", 0)
                .addMetric("bar", 18)

        val filePathTwo = "foo.java"
        val fileMetricsTwo =
            FileMetrics()
                .addMetric("barx", 42)

        val projectMetrics =
            ProjectMetrics()
                .addFileMetrics(filePathOne, fileMetricsOne)
                .addFileMetrics(filePathTwo, fileMetricsTwo)

        // when
        val project = ProjectGenerator().generate(projectMetrics, 10, null)
        val resultFromGenerator = ProjectSerializer.serializeToString(project)
        val resultJSON = JsonParser.parseString(resultFromGenerator)

        // then
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `Should merge piped project when piped-project is not null`() {
        // given
        val expectedResultFile = File("src/test/resources/cc_projects/project_2.cc.json").absoluteFile
        val pipedProject =
            ProjectDeserializer.deserializeProject(
                File("src/test/resources/cc_projects/project_1.cc.json").inputStream()
            )
        val expectedJson = JsonParser.parseReader(expectedResultFile.bufferedReader())

        val filePathOne = "foo.java"
        val fileMetricsOne =
            FileMetrics()
                .addMetric("bar", 18)

        val projectMetrics =
            ProjectMetrics()
                .addFileMetrics(filePathOne, fileMetricsOne)

        // when
        val project = ProjectGenerator().generate(projectMetrics, 10, pipedProject)
        val resultFromGenerator = ProjectSerializer.serializeToString(project)
        val resultJSON = JsonParser.parseString(resultFromGenerator)

        // then
        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }
}
