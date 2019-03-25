package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics
import org.assertj.core.api.Assertions
import org.json.JSONObject

import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.OutputStreamWriter
import java.io.PrintStream

class JSONMetricWriterTest {

  @Test
  fun `project name is set correctly`() {
    val metrics = hashMapOf<String, FileMetrics>()
    val result = ByteArrayOutputStream()
    val projectName = "foo"

    JSONMetricWriter(projectName, OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    Assertions.assertThat(result.toString()).contains("\"projectName\":\"foo\"")
  }

  @Test
  fun `file hierarchy and names are correct`() {
    val metrics = hashMapOf<String, FileMetrics>()
    metrics["foo/bar.java"] = FileMetrics()
    metrics["foo/foo2/bar2.cpp"] = FileMetrics()
    metrics["foo3/bar.java"] = FileMetrics()
    val result = ByteArrayOutputStream()

    JSONMetricWriter("", OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    val resultStructure = JSONObject(result.toString())
    val rootChildren = resultStructure.getJSONArray("nodes").getJSONObject(0).getJSONArray("children")
    Assertions.assertThat(rootChildren.length()).isEqualTo(2)
    for (child in rootChildren){
      val childObject = child as JSONObject
      if(childObject["name"] != "foo3"){
        Assertions.assertThat(childObject["name"]).isEqualTo("foo")
        for (subChild in childObject.getJSONArray("children")){
          val subChildObject = subChild as JSONObject
          if(subChildObject["name"] != "bar.java"){
            Assertions.assertThat(subChildObject.getJSONArray("children").getJSONObject(0)["name"]).isEqualTo("bar2.cpp")
            continue
          }
          Assertions.assertThat(subChildObject["name"]).isEqualTo("bar.java")
        }
      } else {
        Assertions.assertThat(childObject.getJSONArray("children").getJSONObject(0)["name"]).isEqualTo("bar.java")
      }
    }
  }

  @Test
  fun `node metrics are correct`() {
    val fileMetrics1 = FileMetrics().add("mcc", 2).add("rloc", 3)
    val fileMetrics2 = FileMetrics().add("mcc", 1).add("rloc", 4)
    val metrics = mutableMapOf<String, FileMetrics>()
    metrics["foo.java"] = fileMetrics1
    metrics["bar.kt"] = fileMetrics2
    val result = ByteArrayOutputStream()
    val projectName = "foo"

    JSONMetricWriter(projectName, OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    val resultStructure = JSONObject(result.toString())
    val rootChildren = resultStructure.getJSONArray("nodes").getJSONObject(0).getJSONArray("children")
    Assertions.assertThat(rootChildren.length()).isEqualTo(2)
    for (child in rootChildren) {
      val childObject = (child as JSONObject).getJSONArray("children").getJSONObject(0)
      if (childObject["name"] == "foo.java") {
        Assertions.assertThat(childObject.getJSONObject("attributes")["mcc"]).isEqualTo(2)
        Assertions.assertThat(childObject.getJSONObject("attributes")["rloc"]).isEqualTo(3)
      } else {
        Assertions.assertThat(childObject.getJSONObject("attributes")["mcc"]).isEqualTo(1)
        Assertions.assertThat(childObject.getJSONObject("attributes")["rloc"]).isEqualTo(4)
      }
    }
  }

}