package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterGo

class GoPackageQueryEdgeCasesTest {
    private val goPackageQuery = GoPackageQuery(TreeSitterGo())

    @Test
    fun `should handle package name different from directory name`() {
        // Act/Then
        val result = goPackageQuery.derivePackagePathFromFilePath("api/v2/handler.go", listOf("v2"))
        assertThat(result).isEqualTo(listOf("api", "v2"))

        // Act/Then - package name doesn't match directory
        val result2 = goPackageQuery.derivePackagePathFromFilePath("utils/strings/helper.go", listOf("stringutil"))
        assertThat(result2).isEqualTo(listOf("utils", "strings"))
    }

    @Test
    fun `should handle test files`() {
        // Act/Then - test files with _test suffix
        val result = goPackageQuery.derivePackagePathFromFilePath("pkg/utils/helper_test.go", listOf("utils_test"))
        assertThat(result).isEqualTo(listOf("pkg", "utils"))

        // Act/Then - regular test files
        val result2 = goPackageQuery.derivePackagePathFromFilePath("pkg/utils/helper_test.go", listOf("utils"))
        assertThat(result2).isEqualTo(listOf("pkg", "utils"))
    }

    @Test
    fun `should handle vendor directories`() {
        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(
            "vendor/github.com/stretchr/testify/assert/assertions.go",
            listOf("assert")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("vendor", "github.com", "stretchr", "testify", "assert"))
    }

    @Test
    fun `should handle internal packages`() {
        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(
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
        val result = goPackageQuery.derivePackagePathFromFilePath(deepPath, listOf("k"))

        // Assert
        assertThat(result).isEqualTo(listOf("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"))
    }

    @Test
    fun `should handle go mod cache paths`() {
        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(
            "pkg/mod/github.com/gin-gonic/gin@v1.7.0/context.go",
            listOf("gin")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("pkg", "mod", "github.com", "gin-gonic", "gin@v1.7.0"))
    }

    @Test
    fun `should handle generated files`() {
        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(
            "api/v1/service.pb.go",
            listOf("v1")
        )

        // Assert
        assertThat(result).isEqualTo(listOf("api", "v1"))
    }

    @Test
    fun `should handle example and testdata directories`() {
        // Act/Then - examples
        val result1 = goPackageQuery.derivePackagePathFromFilePath("examples/basic/main.go", listOf("main"))
        assertThat(result1).isEqualTo(listOf("examples", "basic"))

        // Act/Then - testdata
        val result2 = goPackageQuery.derivePackagePathFromFilePath("testdata/golden/expected.go", listOf("golden"))
        assertThat(result2).isEqualTo(listOf("testdata", "golden"))
    }

    @Test
    fun `should handle build-tagged files`() {
        // Act/Then - Linux build tag
        val result1 = goPackageQuery.derivePackagePathFromFilePath("pkg/os/file_linux.go", listOf("os"))
        assertThat(result1).isEqualTo(listOf("pkg", "os"))

        // Act/Then - Windows build tag
        val result2 = goPackageQuery.derivePackagePathFromFilePath("pkg/os/file_windows.go", listOf("os"))
        assertThat(result2).isEqualTo(listOf("pkg", "os"))
    }

    @Test
    fun `should handle case sensitivity consistently`() {
        // Act/Then - uppercase path
        val result1 = goPackageQuery.derivePackagePathFromFilePath("API/v1/Handler.go", listOf("v1"))
        assertThat(result1).isEqualTo(listOf("API", "v1"))

        // Act/Then - mixed case
        val result2 = goPackageQuery.derivePackagePathFromFilePath("api/V1/handler.go", listOf("V1"))
        assertThat(result2).isEqualTo(listOf("api", "V1"))
    }
}
