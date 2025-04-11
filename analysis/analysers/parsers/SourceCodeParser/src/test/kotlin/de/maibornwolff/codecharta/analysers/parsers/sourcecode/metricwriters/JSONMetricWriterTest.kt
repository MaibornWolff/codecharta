package de.maibornwolff.codecharta.analysers.parsers.sourcecode.metricwriters

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.FileMetricMap
import de.maibornwolff.codecharta.analysers.parsers.sourcecode.metrics.ProjectMetrics
import org.assertj.core.api.Assertions
import org.json.JSONObject
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File

class JSONMetricWriterTest {
    @Test
    fun `file hierarchy and names are correct`() {
        val expectedResultFile = File("src/test/resources/jsonMetricHierarchy.json").absoluteFile
        val metrics = ProjectMetrics()
        addFileInProject(metrics, "foo/bar.java")
        addFileInProject(metrics, "foo/foo2/bar2.cpp")
        addFileInProject(metrics, "foo3/bar.java")
        val result = ByteArrayOutputStream()

        JSONMetricWriter(result, false).generate(metrics, setOf())
        val resultJSON = JsonParser.parseString(result.toString())
        val expectedJSON = JsonParser.parseReader(expectedResultFile.reader())

        Assertions.assertThat(resultJSON).isEqualTo(expectedJSON)
    }

    @Test
    fun `node metrics are correct and attributes descriptors are included`() {
        val expectedResultFile = File("src/test/resources/jsonMetricValues.json").absoluteFile
        val fileMetrics1 = FileMetricMap().add("complexity", 2).add("rloc", 3)
        val fileMetrics2 = FileMetricMap().add("complexity", 1).add("rloc", 4)
        val metrics = ProjectMetrics()
        metrics.addFileMetricMap("foo.java", fileMetrics1)
        metrics.addFileMetricMap("bar.kt", fileMetrics2)
        val result = ByteArrayOutputStream()

        JSONMetricWriter(result, false).generate(metrics, setOf())
        val resultJSON = JsonParser.parseString(result.toString())
        val expectedJSON = JsonParser.parseReader(expectedResultFile.reader())

        Assertions.assertThat(resultJSON).isEqualTo(expectedJSON)
    }

    @Test
    fun `top level files are embedded correctly`() {
        val fileMetrics = FileMetricMap().add("mcc", 2).add("rloc", 3)
        val metrics = ProjectMetrics()
        metrics.addFileMetricMap("foo.java", fileMetrics)
        val result = ByteArrayOutputStream()

        JSONMetricWriter(result, false).generate(metrics, setOf())

        val resultJSON = JSONObject(result.toString())
        val leaf =
            resultJSON.getJSONObject("data").getJSONArray("nodes").getJSONObject(0).getJSONArray("children")
                .getJSONObject(0)
        Assertions.assertThat(leaf["type"]).isEqualTo("File")
        Assertions.assertThat(leaf["name"]).isEqualTo("foo.java")
        Assertions.assertThat(leaf.getJSONObject("attributes").length()).isEqualTo(2)
    }

    private fun addFileInProject(currentProject: ProjectMetrics, file: String) {
        currentProject.projectMetrics[file] = FileMetricMap()
    }
}
