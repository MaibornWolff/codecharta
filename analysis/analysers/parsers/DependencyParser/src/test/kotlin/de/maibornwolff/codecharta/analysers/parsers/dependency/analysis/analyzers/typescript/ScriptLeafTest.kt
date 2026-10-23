package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ScriptLeafTest {
    @Test
    fun `should name the script leaf of a module after its file without the ending`() {
        // Arrange
        val modulePath = Path(listOf("src", "main"))

        // Act
        val path = ScriptLeaf.pathIn(modulePath)

        // Assert
        assertThat(path).isEqualTo(Path(listOf("src", "main", "main.script")))
    }
}
