package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract.MetricExtractor
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Api
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class MetricPrint {
    @Test
    @Throws(IOException::class)
    fun prints_all_rows_plus_header_and_underline() {
        val resource = "$javaBaseFolder/RealLinesShort.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)
        val metricExtractor = MetricExtractor(sourceCode)

        val output = prettyPrint(metricExtractor)

        assertThat(output.lines().size).isEqualTo(metricExtractor.rowCount() + 2)
    }

    @Test
    @Throws(IOException::class)
    fun prints_correct_header_order() {
        val resource = "$javaBaseFolder/RealLinesShort.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)
        val metricExtractor = MetricExtractor(sourceCode)

        val output = prettyPrint(metricExtractor)

        assertThat(elementsOf(output.lines()[0])).containsExactly("LoC", "RLoC", "Code", "Tags")
    }

    @Test
    @Throws(IOException::class)
    fun prints_underline() {
        val resource = "$javaBaseFolder/RealLinesShort.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)
        val metricExtractor = MetricExtractor(sourceCode)

        val output = prettyPrint(metricExtractor)

        assertThat(output.lines()[1]).containsPattern("[-]{20,}")
    }

    @Test
    @Throws(IOException::class)
    fun prints_real_line_count_when_it_was_incremented() {
        val resource = "$javaBaseFolder/RealLinesShort.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)
        val metricExtractor = MetricExtractor(sourceCode)

        val output = prettyPrint(metricExtractor)

        assertThatMetricElement(metricExtractor){elementsOf(output.lines()[3])[1]}.isEqualTo("2")
    }

    @Test
    @Throws(IOException::class)
    fun does_not_print_real_line_count_when_it_wasnt_incremented_and_instead_prints_empty_tag_list() {
        val resource = "$javaBaseFolder/RealLinesShort.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)
        val metricExtractor = MetricExtractor(sourceCode)

        val output = prettyPrint(metricExtractor)

        assertThatMetricElement(metricExtractor){elementsOf(output.lines()[4])[1]}.isEqualTo("[]")
    }

    private fun elementsOf(text: String) = text.split(' ').filter { it.isNotEmpty() }
}