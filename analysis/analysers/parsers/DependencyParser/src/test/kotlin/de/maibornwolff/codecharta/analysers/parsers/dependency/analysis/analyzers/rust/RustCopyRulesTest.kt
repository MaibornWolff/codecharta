package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class RustCopyRulesTest {
    private fun file(slashed: String) = FilePath(slashed.split("/"))

    @Test
    fun `should point at the declaration, not at an implementation part nearer to the using file`() {
        // Arrange
        val copies = listOf(DeclaringCopy(file("src/model/creature.rs"), false), DeclaringCopy(file("src/app/display.rs"), true))

        // Act
        val files = RustCopyRules.filesFor(copies, file("src/app/display.rs"))

        // Assert
        assertThat(files).containsExactly(file("src/model/creature.rs"))
    }

    @Test
    fun `should point at an implementation part where no declaration of its path is`() {
        // Arrange
        val copies = listOf(DeclaringCopy(file("src/app/display.rs"), true))

        // Act
        val files = RustCopyRules.filesFor(copies, file("src/app/display.rs"))

        // Assert
        assertThat(files).containsExactly(file("src/app/display.rs"))
    }

    @Test
    fun `should point at the nearest of several declarations`() {
        // Arrange
        val copies = listOf(DeclaringCopy(file("two/src/model.rs"), false), DeclaringCopy(file("one/src/model.rs"), false))

        // Act
        val files = RustCopyRules.filesFor(copies, file("one/src/arena.rs"))

        // Assert
        assertThat(files).containsExactly(file("one/src/model.rs"))
    }
}
