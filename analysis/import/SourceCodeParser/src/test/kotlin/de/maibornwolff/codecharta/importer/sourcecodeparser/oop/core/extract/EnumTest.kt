package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Api
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.prettyPrint
import org.assertj.core.api.Assertions
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class EnumTest {

    @Test
    @Throws(IOException::class)
    fun enum_example_1_has_correct_rloc_count() {
        val resource = "$javaBaseFolder/Enum1.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)

        val metricExtractor = MetricExtractor(sourceCode)

        Assertions.assertThat(metricExtractor[17].rloc).describedAs("\n"+prettyPrint(metricExtractor)).isEqualTo(7)
    }

    @Test
    @Throws(IOException::class)
    fun enum_example_2_has_correct_rloc_count() {
        val resource = "$javaBaseFolder/Enum2.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)

        val metricExtractor = MetricExtractor(sourceCode)

        Assertions.assertThat(metricExtractor[18].rloc).describedAs("\n"+prettyPrint(metricExtractor)).isEqualTo(9)
    }

}