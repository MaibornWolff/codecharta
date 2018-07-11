package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricTable
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableFile
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Antlr
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class EnumTest {

    @Test
    @Throws(IOException::class)
    fun enum_example_1_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/Enum1.java"
        val sourceCode = TaggableFile(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)

        val metricExtractor = MetricTable(sourceCode, OopMetricStrategy())

        assertThatMetricElement(metricExtractor){it.summary()[MetricType.RLoc]}.isEqualTo(7)
    }

    @Test
    @Throws(IOException::class)
    fun enum_example_2_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/Enum2.java"
        val sourceCode = TaggableFile(OopLanguage.JAVA, Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Antlr.addTagsToSource(sourceCode)

        val metricExtractor = MetricTable(sourceCode, OopMetricStrategy())

        assertThatMetricElement(metricExtractor){it.summary()[MetricType.RLoc]}.isEqualTo(9)
    }

}