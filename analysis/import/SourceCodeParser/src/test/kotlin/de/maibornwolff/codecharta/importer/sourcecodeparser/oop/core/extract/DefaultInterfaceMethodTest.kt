package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertThatMetricElement
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Api
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class DefaultInterfaceMethodTest {
    @Test
    @Throws(IOException::class)
    fun annotation_example_has_correct_rloc_count() {
        val resource = "$javaBaseFolder/DefaultInterfaceMethod.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)

        val metricExtractor = MetricExtractor(sourceCode)

        assertThatMetricElement(metricExtractor) {it[12].rloc}.isEqualTo(4)
    }
}