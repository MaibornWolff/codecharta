package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.security.MessageDigest
import java.util.HexFormat

class BundledCoreLibraryTest {
    // A binary cannot be reviewed in a diff, so replacing the library has to show up as a changed checksum here.
    // The workflow build_tree_sitter_core_windows.yml prints the checksum of the library it builds.
    private val windowsCoreLibrary = "lib/x86_64-windows-tree-sitter-core.dll"
    private val checksumOfWorkflowBuild = "aa3b8a8edd9b3c43dbeb75138427bde16aa7f97a774ba52e3bb998d625e19f65"

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
