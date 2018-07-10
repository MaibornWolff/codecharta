package de.maibornwolff.codecharta.importer.sourcecodeparser.integration.application

import de.maibornwolff.codecharta.importer.sourcecodeparser.elementsOf
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.integrationBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.integration.infrastructure.FileSystemSourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.OopApp
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics.OopMetricStrategy
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class MetricPrintTest {
    @Test
    @Throws(IOException::class)
    fun prints_all_rows_plus_header_and_underline() {
        val resource = "$integrationBaseFolder/java/RealLinesShort.java"
        val sourceCode = FileSystemSourceCode(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI()).toFile())
        val metricExtractor = OopApp().fileSummary(sourceCode)

        val output = fileMetricToTabular(metricExtractor)

        assertThat(output.lines().size).isEqualTo(metricExtractor.rowCount() + 2)
    }

    @Test
    @Throws(IOException::class)
    fun prints_correct_header_order() {
        val resource = "$integrationBaseFolder/java/RealLinesShort.java"
        val sourceCode = TaggableFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)
        val metricExtractor = MetricTable(sourceCode, OopMetricStrategy())

        val output = fileMetricToTabular(metricExtractor)

        assertThat(elementsOf(output.lines()[0])).containsExactly("LoC", "RLoC", "Code", "Tags")
    }

    @Test
    @Throws(IOException::class)
    fun prints_underline() {
        val resource = "$integrationBaseFolder/java/RealLinesShort.java"
        val sourceCode = TaggableFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)
        val metricExtractor = MetricTable(sourceCode, OopMetricStrategy())

        val output = fileMetricToTabular(metricExtractor)

        assertThat(output.lines()[1]).containsPattern("[-]{20,}")
    }

    @Test
    @Throws(IOException::class)
    fun prints_real_line_count_when_it_was_incremented() {
        val resource = "$integrationBaseFolder/java/RealLinesShort.java"
        val sourceCode = TaggableFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)
        val metricExtractor = MetricTable(sourceCode, OopMetricStrategy())

        val output = fileMetricToTabular(metricExtractor)

        assertThatMetricElement(metricExtractor){elementsOf(output.lines()[3])[1]}.isEqualTo("2")
    }

    @Test
    @Throws(IOException::class)
    fun does_not_print_real_line_count_when_it_wasnt_incremented_and_instead_prints_empty_tag_list() {
        val resource = "$integrationBaseFolder/java/RealLinesShort.java"
        val sourceCode = TaggableFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)
        val metricExtractor = MetricTable(sourceCode, OopMetricStrategy())

        val output = fileMetricToTabular(metricExtractor)

        assertThatMetricElement(metricExtractor){elementsOf(output.lines()[4])[1]}.isEqualTo("[]")
    }
}