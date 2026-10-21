package de.maibornwolff.codecharta.analysers.parsers.dependency.regression

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class KnownGapsTest {
    @Test
    fun `should read the gaps of each probe from its section of a language's known gaps`() {
        // Arrange
        val markdown = """
            # Known gaps: Java

            ## spec-type-parameter

            A type parameter does not shadow a type of the own package.

            ```text
            extra file a/Box.java -> a/Config.java
            missing leaf a/Box.java#Box -> a/Other.java#Other
            ```

            ## spec-local-class

            A local class does not shadow a type of the own package.

            ```text
            extra file a/Service.java -> a/Helper.java
            ```
        """.trimIndent()

        // Act
        val gapsByProbe = KnownGaps.sectionsOf(markdown.lines())

        // Assert
        assertThat(gapsByProbe.keys).containsExactly("spec-type-parameter", "spec-local-class")
        assertThat(gapsByProbe.getValue("spec-type-parameter").extra).containsExactly("file a/Box.java -> a/Config.java")
        assertThat(gapsByProbe.getValue("spec-type-parameter").missing).containsExactly("leaf a/Box.java#Box -> a/Other.java#Other")
        assertThat(gapsByProbe.getValue("spec-local-class").extra).containsExactly("file a/Service.java -> a/Helper.java")
    }
}
