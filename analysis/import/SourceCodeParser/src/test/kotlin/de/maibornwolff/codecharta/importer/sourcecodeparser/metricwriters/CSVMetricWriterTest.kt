package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.io.OutputStreamWriter
import java.io.PrintStream

class CSVMetricWriterTest {

  @Test
  fun `empty project no metrics nor files`() {
    val metrics = hashMapOf<String, FileMetricMap>()
    val result = ByteArrayOutputStream()

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    assertThat(result.toString()).isEqualTo("file\n")
  }

  @Test
  fun `paths for files are correct`() {
    val metrics = mutableMapOf<String, FileMetricMap>()
    metrics["myFile.java"] = FileMetricMap()
    metrics["foo/bar/myFile.java"] = FileMetricMap()
    val result = ByteArrayOutputStream()

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    assertThat(result.toString()).isEqualTo("file\nmyFile.java\nfoo/bar/myFile.java\n")
  }

  @Test
  fun `header of csv is correct`() {
    val metrics = mutableMapOf<String, FileMetricMap>()
    val result = ByteArrayOutputStream()
    val allMetrics = setOf("foo", "bar")

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, allMetrics)

    assertThat(result.toString()).isIn(setOf("file,foo,bar\n", "file,bar,foo\n"))
  }

  @Test
  fun `metrics are written correct`() {
    val fileMetrics1 = FileMetricMap().add("mcc", 2).add("rloc", 3)
    val fileMetrics2 = FileMetricMap().add("mcc", 1).add("rloc", 4)
    val metrics = mutableMapOf<String, FileMetricMap>()
    metrics["foo"] = fileMetrics1
    metrics["bar"] = fileMetrics2
    val result = ByteArrayOutputStream()
    val allMetrics = setOf("mcc", "rloc")

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, allMetrics)

    assertThat(result.toString()).isIn(setOf("file,mcc,rloc\nfoo,2,3\nbar,1,4\n", "file,mcc,rloc\nfoo,2,3\nbar,1,4\n"))
  }

  @Test
  fun `missing metrics lead to empty fields in csv`() {
    val metrics = mutableMapOf<String, FileMetricMap>()
    metrics.put("bla", FileMetricMap())
    val allMetrics = setOf("foo","bar")
    val result = ByteArrayOutputStream()

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, allMetrics)

    assertThat(result.toString()).isEqualTo("file,foo,bar\nbla,,\n")

  }

}