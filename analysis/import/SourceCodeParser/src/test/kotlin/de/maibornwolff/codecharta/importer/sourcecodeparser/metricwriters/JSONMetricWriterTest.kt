package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import org.assertj.core.api.Assertions
import org.json.JSONObject
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStreamWriter
import java.io.PrintStream


class JSONMetricWriterTest {

    @Test
    fun `file hierarchy and names are correct`() {
        val expectedResultFile = File("src/test/resources/jsonMetricHierarchy.json").absoluteFile
        val metrics = ProjectMetrics()
        metrics.addFile("foo/bar.java")
        metrics.addFile("foo/foo2/bar2.cpp")
        metrics.addFile("foo3/bar.java")
        val result = ByteArrayOutputStream()

        JSONMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

        val resultJSON = JSONObject(result.toString()).toString()

        val parser = JsonParser()
        val expectedJson = parser.parse(expectedResultFile.reader()).toString()

        Assertions.assertThat(resultJSON).isEqualTo(expectedJson)
    }

    @Test
    fun `node metrics are correct`() {
        val expectedResultFile = File("src/test/resources/jsonMetricValues.json").absoluteFile
        val fileMetrics1 = FileMetricMap().add("mcc", 2).add("rloc", 3)
        val fileMetrics2 = FileMetricMap().add("mcc", 1).add("rloc", 4)
        val metrics = ProjectMetrics()
        metrics.addFileMetricMap("foo.java", fileMetrics1)
        metrics.addFileMetricMap("bar.kt", fileMetrics2)
        val result = ByteArrayOutputStream()

        JSONMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

        val resultJSON = JSONObject(result.toString()).toString()

        val parser = JsonParser()
        val expectedJson = parser.parse(expectedResultFile.reader()).toString()


        Assertions.assertThat(resultJSON == expectedJson).isTrue()
    }

    @Test
    fun `top level files are embedded correctly`() {
        val fileMetrics = FileMetricMap().add("mcc", 2).add("rloc", 3)
        val metrics = ProjectMetrics()
        metrics.addFileMetricMap("foo.java", fileMetrics)
        val result = ByteArrayOutputStream()

        JSONMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

        val resultJSON = JSONObject(result.toString())
        val leaf = resultJSON.getJSONArray("nodes").getJSONObject(0).getJSONArray("children").getJSONObject(0)
        Assertions.assertThat(leaf["type"]).isEqualTo("File")
        Assertions.assertThat(leaf["name"]).isEqualTo("foo.java")
        Assertions.assertThat(leaf.getJSONObject("attributes").length()).isEqualTo(2)
    }

}