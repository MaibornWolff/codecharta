package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.Metric
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.SourceFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class ConstructorAndInitializerTest {
    @Test
    @Throws(IOException::class)
    fun example_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/ConstructorAndInitializer.java"
        val sourceCode = SourceFile(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)

        val metricExtractor = RowMetrics(sourceCode)

        assertThatMetricElement(metricExtractor) {it.summary()[Metric.RLoc]}.isEqualTo(9)
    }
}