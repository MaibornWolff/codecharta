package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import org.junit.Test
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics

import org.assertj.core.api.Assertions.assertThat
import java.io.*

class CSVMetricWriterTest {

  @Test
  fun `empty project no metrics nor files`() {
    val metrics = hashMapOf<String, FileMetrics>()
    val result = ByteArrayOutputStream()

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    assertThat(result.toString()).isEqualTo("file\n")
  }

  @Test
  fun `paths for files are correct`() {
    val metrics = mutableMapOf<String, FileMetrics>()
    metrics["myFile.java"] = FileMetrics()
    metrics["foo/bar/myFile.java"] = FileMetrics()
    val result = ByteArrayOutputStream()

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, setOf())

    assertThat(result.toString()).isEqualTo("file\nmyFile.java\nfoo/bar/myFile.java\n")
  }

  @Test
  fun `header of csv is correct`() {
    val metrics = mutableMapOf<String, FileMetrics>()
    val result = ByteArrayOutputStream()
    val allMetrics = setOf("foo", "bar")

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, allMetrics)

    assertThat(result.toString()).isIn(setOf("file,foo,bar\n", "file,bar,foo\n"))
  }

  @Test
  fun `metrics are written correct`() {
    val fileMetrics1 = FileMetrics().add("mcc", 2).add("rloc", 3)
    val fileMetrics2 = FileMetrics().add("mcc", 1).add("rloc", 4)
    val metrics = mutableMapOf<String, FileMetrics>()
    metrics["foo"] = fileMetrics1
    metrics["bar"] = fileMetrics2
    val result = ByteArrayOutputStream()
    val allMetrics = setOf("mcc", "rloc")

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, allMetrics)

    assertThat(result.toString()).isIn(setOf("file,mcc,rloc\nfoo,2,3\nbar,1,4\n", "file,mcc,rloc\nfoo,2,3\nbar,1,4\n"))
  }

  @Test
  fun `missing metrics lead to empty fields in csv`() {
    val metrics = mutableMapOf<String, FileMetrics>()
    metrics.put("bla", FileMetrics())
    val allMetrics = setOf("foo","bar")
    val result = ByteArrayOutputStream()

    CSVMetricWriter(OutputStreamWriter(PrintStream(result))).generate(metrics, allMetrics)

    assertThat(result.toString()).isEqualTo("file,foo,bar\nbla,,\n")

  }

}