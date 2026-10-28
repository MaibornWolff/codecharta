package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoPackagePathEdgeCasesTest {
    @Test
    fun `should handle package name different from directory name`() {
        // Act & Assert
        val result = GoPackagePath.derive("api/v2/handler.go", listOf("v2"))
        assertThat(result).isEqualTo(listOf("api", "v2"))

        val result2 = GoPackagePath.derive("utils/strings/helper.go", listOf("stringutil"))
        assertThat(result2).isEqualTo(listOf("utils", "strings"))
    }

    @Test
    fun `should give an external test package its own path below the folder, and a test file of the package the folder`() {
        // Act & Assert
        val result = GoPackagePath.derive("pkg/utils/helper_test.go", listOf("utils_test"))
        assertThat(result).isEqualTo(listOf("pkg", "utils", "utils_test"))

        val result2 = GoPackagePath.derive("pkg/utils/helper_test.go", listOf("utils"))
        assertThat(result2).isEqualTo(listOf("pkg", "utils"))
    }

    @Test
    fun `should handle vendor directories`() {
        // Act
        val result = GoPackagePath.derive(
            "vendor/github.com/stretchr/testify/assert/assertions.go",
            listOf("assert")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("vendor", "github.com", "stretchr", "testify", "assert"))
    }

    @Test
    fun `should handle internal packages`() {
        // Act
        val result = GoPackagePath.derive(
            "internal/auth/token.go",
            listOf("auth")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("internal", "auth"))
    }

    @Test
    fun `should handle very deep nesting`() {
        // Arrange
        val deepPath = "a/b/c/d/e/f/g/h/i/j/k/file.go"

        // Act
        val result = GoPackagePath.derive(deepPath, listOf("k"))

        // Assert
        assertThat(result).isEqualTo(listOf("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"))
    }

    @Test
    fun `should handle go mod cache paths`() {
        // Act
        val result = GoPackagePath.derive(
            "pkg/mod/github.com/gin-gonic/gin@v1.7.0/context.go",
            listOf("gin")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("pkg", "mod", "github.com", "gin-gonic", "gin@v1.7.0"))
    }

    @Test
    fun `should handle generated files`() {
        // Act
        val result = GoPackagePath.derive(
            "api/v1/service.pb.go",
            listOf("v1")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("api", "v1"))
    }

    @Test
    fun `should handle example and testdata directories`() {
        // Act & Assert
        val result1 = GoPackagePath.derive("examples/basic/main.go", listOf("main"))
        assertThat(result1).isEqualTo(listOf("examples", "basic"))

        val result2 = GoPackagePath.derive("testdata/golden/expected.go", listOf("golden"))
        assertThat(result2).isEqualTo(listOf("testdata", "golden"))
    }

    @Test
    fun `should handle build-tagged files`() {
        // Act & Assert
        val result1 = GoPackagePath.derive("pkg/os/file_linux.go", listOf("os"))
        assertThat(result1).isEqualTo(listOf("pkg", "os"))

        val result2 = GoPackagePath.derive("pkg/os/file_windows.go", listOf("os"))
        assertThat(result2).isEqualTo(listOf("pkg", "os"))
    }

    @Test
    fun `should handle case sensitivity consistently`() {
        // Act & Assert
        val result1 = GoPackagePath.derive("API/v1/Handler.go", listOf("v1"))
        assertThat(result1).isEqualTo(listOf("API", "v1"))

        val result2 = GoPackagePath.derive("api/V1/handler.go", listOf("V1"))
        assertThat(result2).isEqualTo(listOf("api", "V1"))
    }
}
