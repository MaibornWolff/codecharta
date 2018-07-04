package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Api
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.prettyPrint
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class EnumTest {

    @Test
    @Throws(IOException::class)
    fun enum_example_1_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/Enum1.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)

        val metricExtractor = MetricExtractor(sourceCode)

        assertThatMetricElement(metricExtractor){it[17].rloc}.isEqualTo(7)
    }

    @Test
    @Throws(IOException::class)
    fun enum_example_2_has_correct_rloc_count() {
        val resource = "$extractBaseFolder/java/Enum2.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)

        val metricExtractor = MetricExtractor(sourceCode)

        assertThatMetricElement(metricExtractor){it[17].rloc}.describedAs("\n"+prettyPrint(metricExtractor)).isEqualTo(9)
    }

}