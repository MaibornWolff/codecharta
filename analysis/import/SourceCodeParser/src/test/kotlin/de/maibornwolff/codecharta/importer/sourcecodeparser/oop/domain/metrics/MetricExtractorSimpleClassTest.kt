package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.SingleMetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.assertj.core.api.Assertions
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class MetricExtractorSimpleClassTest {

    @Test(expected = IndexOutOfBoundsException::class)
    @Throws(IOException::class)
    fun trying_index_0_results_in_exceptions_because_code_starts_at_line_1() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val metricExtractor = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        metricExtractor[0]
    }

    @Test
    @Throws(IOException::class)
    fun trying_last_index_does_not_result_in_exception() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val rowMetrics = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        rowMetrics[rowMetrics.rowCount()]
    }

    @Test
    @Throws(IOException::class)
    fun does_not_count_empty_line_as_real() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val rowMetrics = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        Assertions.assertThat(rowMetrics[1][MetricType.RLoc]).isEqualTo(1)
        Assertions.assertThat(rowMetrics[2][MetricType.RLoc]).isEqualTo(1)
        Assertions.assertThat(rowMetrics[2].metricWasIncremented(MetricType.RLoc, rowMetrics[1])).isFalse()
        Assertions.assertThat(rowMetrics[3][MetricType.RLoc]).isEqualTo(2)
        Assertions.assertThat(rowMetrics[3].metricWasIncremented(MetricType.RLoc, rowMetrics[2])).isTrue()
    }

    @Test
    @Throws(IOException::class)
    fun does_not_count_comment_line_as_real() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val rowMetrics = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        Assertions.assertThat(rowMetrics[8][MetricType.RLoc]).isEqualTo(3)
        Assertions.assertThat(rowMetrics[9][MetricType.RLoc]).isEqualTo(4)
    }

    @Test
    @Throws(IOException::class)
    fun does_not_count_lines_with_only_a_bracket_as_real() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val rowMetrics = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        Assertions.assertThat(rowMetrics[19][MetricType.RLoc]).isEqualTo(10)
        Assertions.assertThat(rowMetrics[20][MetricType.RLoc]).isEqualTo(10)
    }

    @Test
    @Throws(IOException::class)
    fun counts_all_lines_as_lines_of_code() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val rowMetrics = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        Assertions.assertThat(rowMetrics.rowCount()).isEqualTo(43)
    }

    @Test
    @Throws(IOException::class)
    fun counts_only_lines_with_actual_value_as_real() {
        val resource = "$extractBaseFolder/java/SourceCodeSimple.java"
        val sourceCode = TaggableLines(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTags(sourceCode)

        val rowMetrics = SingleMetricTable(sourceCode, OopMetricCalculationStrategy())

        Assertions.assertThat(rowMetrics[43][MetricType.RLoc]).isEqualTo(25)
    }
}