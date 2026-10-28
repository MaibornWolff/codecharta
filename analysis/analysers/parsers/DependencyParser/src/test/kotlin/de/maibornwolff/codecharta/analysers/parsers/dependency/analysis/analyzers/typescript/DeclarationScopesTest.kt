package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_AMBIENT_MODULE_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_GLOBAL_SEGMENT
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DeclarationScopesTest {
    @Test
    fun `should give a global declaration the namespaces below its file without the global marker`() {
        // Arrange
        val parentPath = listOf(TSE_GLOBAL_SEGMENT, "Shapes")

        // Act
        val namespaces = DeclarationScopes.namespacesOf(parentPath)

        // Assert
        assertThat(namespaces).containsExactly("Shapes")
    }

    @Test
    fun `should give a declaration of a declare module block no namespaces below its file`() {
        // Arrange
        val parentPath = listOf(TSE_AMBIENT_MODULE_SEGMENT, "legacy-lib")

        // Act
        val namespaces = DeclarationScopes.namespacesOf(parentPath)

        // Assert
        assertThat(namespaces).isEmpty()
    }
}
