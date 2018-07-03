package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.extract

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java.Api
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.core.intermediate.SourceCode
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.res.javaBaseFolder
import org.assertj.core.api.Assertions
import org.junit.Test
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

class EnumTest {

    @Test
    @Throws(IOException::class)
    fun trying_last_index_does_not_result_in_exception() {
        val resource = "$javaBaseFolder/Enum1.java"
        val sourceCode = SourceCode(Files.readAllLines(Paths.get(javaClass.classLoader.getResource(resource)!!.toURI())))
        Api.addTagsToSource(sourceCode)

        val metricExtractor = MetricExtractor(sourceCode)

        Assertions.assertThat(metricExtractor[17].rloc).isEqualTo(7)
    }

}