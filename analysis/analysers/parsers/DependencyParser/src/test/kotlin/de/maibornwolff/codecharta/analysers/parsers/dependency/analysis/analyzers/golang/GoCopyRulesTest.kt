package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoCopyRulesTest {
    private fun file(path: String) = FilePath(path.split("/"))

    @Test
    fun `should point at every file of the package that declares the path`() {
        // Arrange
        val declaringFiles = listOf("fs/open_linux.go", "fs/open_windows.go").map { DeclaringCopy(file(it), isFileScoped = false) }

        // Act
        val files = GoCopyRules.filesFor(declaringFiles, file("core/core.go"))

        // Assert
        assertThat(files).containsExactly(file("fs/open_linux.go"), file("fs/open_windows.go"))
    }
}
