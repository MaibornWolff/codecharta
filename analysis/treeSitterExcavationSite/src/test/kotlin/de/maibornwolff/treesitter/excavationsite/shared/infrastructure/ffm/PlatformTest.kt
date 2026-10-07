package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class PlatformTest {
    @ParameterizedTest
    @CsvSource(
        "Linux, amd64, x86_64-linux-gnu-tree-sitter-go.so",
        "Linux, aarch64, aarch64-linux-gnu-tree-sitter-go.so",
        "Mac OS X, x86_64, x86_64-macos-tree-sitter-go.dylib",
        "Mac OS X, aarch64, aarch64-macos-tree-sitter-go.dylib",
        "Mac OS X, arm64, aarch64-macos-tree-sitter-go.dylib",
        "Windows 11, amd64, x86_64-windows-tree-sitter-go.dll"
    )
    fun `should name the library like the bundled file of the platform`(osName: String, osArch: String, expectedFileName: String) {
        // Arrange
        val platform = Platform.of(osName, osArch)

        // Act
        val fileName = platform.libraryFileName("tree-sitter-go")

        // Assert
        assertThat(fileName).isEqualTo(expectedFileName)
    }

    @Test
    fun `should name the unsupported architecture when it is unknown`() {
        // Arrange
        val unsupportedArchitecture = "riscv64"

        // Act & Assert
        assertThatThrownBy { Platform.of("Linux", unsupportedArchitecture) }
            .isInstanceOf(UnsatisfiedLinkError::class.java)
            .hasMessageContaining(unsupportedArchitecture)
    }

    @Test
    fun `should name the unsupported operating system when it is unknown`() {
        // Arrange
        val unsupportedSystem = "FreeBSD"

        // Act & Assert
        assertThatThrownBy { Platform.of(unsupportedSystem, "amd64") }
            .isInstanceOf(UnsatisfiedLinkError::class.java)
            .hasMessageContaining(unsupportedSystem)
    }
}
