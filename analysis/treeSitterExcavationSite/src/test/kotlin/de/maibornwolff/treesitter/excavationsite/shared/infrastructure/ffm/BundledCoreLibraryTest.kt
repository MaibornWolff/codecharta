package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.security.MessageDigest
import java.util.HexFormat

class BundledCoreLibraryTest {
    // A binary cannot be reviewed in a diff, so replacing the library has to show up as a changed checksum here.
    // The workflow build_tree_sitter_core_windows.yml prints the checksum of the library it builds.
    private val windowsCoreLibrary = "lib/x86_64-windows-tree-sitter-core.dll"
    private val checksumOfWorkflowBuild = "1fdf9c5095d1b40fa4e1c96997247e6fd0791d09843cd23bf4e7eb4423d46fda"

    @Test
    fun `should bundle the Windows core library the workflow built`() {
        // Arrange
        val content = javaClass.classLoader.getResourceAsStream(windowsCoreLibrary)!!.use { it.readAllBytes() }

        // Act
        val checksum = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content))

        // Assert
        assertThat(checksum).isEqualTo(checksumOfWorkflowBuild)
    }
}
