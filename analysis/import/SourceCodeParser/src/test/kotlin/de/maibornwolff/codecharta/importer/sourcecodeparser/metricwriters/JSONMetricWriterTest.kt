package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import org.assertj.core.api.Assertions
import org.json.JSONObject
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.OutputStreamWriter
import java.io.PrintStream


class JSONMetricWriterTest {

    // TODO: The tests fail for some reason on Travis.
    // TODO: Find a better way to test the JSON-string structure.
    // TODO: Can we assume the order in JSON Array?

    @Test
    fun `project name is set correctly`() {
        val metrics = hashMapOf<String, FileMetricMap>()
        val result = ByteArrayOutputStream()
        val projectName = "foo"

        JSONMetricWriter(projectName, OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

        Assertions.assertThat(result.toString()).contains("\"projectName\":\"foo\"")
    }

    @Test
    fun `file hierarchy and names are correct`() {
        val expectedResultFile = File("src/test/resources/jsonMetricHierarchy.json").absoluteFile
        val metrics = hashMapOf<String, FileMetricMap>()
        metrics["foo/bar.java"] = FileMetricMap()
        metrics["foo/foo2/bar2.cpp"] = FileMetricMap()
        metrics["foo3/bar.java"] = FileMetricMap()
        val result = ByteArrayOutputStream()

        JSONMetricWriter("", OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

        val resultJSON = JSONObject(result.toString()).toString()

        val parser = JsonParser()
        val expectedJson = parser.parse(expectedResultFile.reader()).toString()

        Assertions.assertThat(resultJSON == expectedJson).isTrue()
    }

    @Test
    fun `node metrics are correct`() {
        val expectedResultFile = File("src/test/resources/jsonMetricValues.json").absoluteFile
        val fileMetrics1 = FileMetricMap().add("mcc", 2).add("rloc", 3)
        val fileMetrics2 = FileMetricMap().add("mcc", 1).add("rloc", 4)
        val metrics = mutableMapOf<String, FileMetricMap>()
        metrics["foo.java"] = fileMetrics1
        metrics["bar.kt"] = fileMetrics2
        val result = ByteArrayOutputStream()
        val projectName = "foo"

        JSONMetricWriter(projectName, OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

        val resultJSON = JSONObject(result.toString()).toString()

        println(resultJSON)

        val parser = JsonParser()
        val expectedJson = parser.parse(expectedResultFile.reader()).toString()


        Assertions.assertThat(resultJSON == expectedJson).isTrue()
    }

}