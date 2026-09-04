package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterGo

class GoPackageQueryTest {
    private lateinit var goPackageQuery: GoPackageQuery

    @BeforeEach
    fun setUp() {
        goPackageQuery = GoPackageQuery(TreeSitterGo())
    }

    @Test
    fun `derivePackagePathFromFilePath should return directory path when packageName is main`() {
        // Given
        val filePath = "some/path/to/file.go"
        val packageName = listOf("main")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("some", "path", "to"))
    }

    @Test
    fun `derivePackagePathFromFilePath should return dirParts when packageName is not main and dirParts exist`() {
        // Given
        val filePath = "project/internal/config/file.go"
        val packageName = listOf("config")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("project", "internal", "config"))
    }

    @Test
    fun `derivePackagePathFromFilePath should return packageName when dirParts empty and packageName not empty and not main`() {
        // Given
        val filePath = "file.go" // no directory structure
        val packageName = listOf("somepackage")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("somepackage"))
    }

    @Test
    fun `derivePackagePathFromFilePath should return unknown when both dirParts and packageName are empty`() {
        // Given
        val filePath = "file.go" // no directory structure
        val packageName = emptyList<String>()

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("unknown"))
    }

    @Test
    fun `derivePackagePathFromFilePath should return unknown when dirParts empty and packageName empty despite having a path`() {
        // Given
        val filePath = "" // empty path
        val packageName = emptyList<String>()

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("unknown"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle complex nested paths`() {
        // Given
        val filePath = "github.com/myuser/myproject/internal/service/handler/user.go"
        val packageName = listOf("handler")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("github.com", "myuser", "myproject", "internal", "service", "handler"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle Windows-style paths`() {
        // Given
        val filePath = "project\\internal\\config\\file.go"
        val packageName = listOf("config")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("project", "internal", "config"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle packageName with multiple elements but not main`() {
        // Given
        val filePath = "file.go" // no directory structure
        val packageName = listOf("complex", "package", "name")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("complex", "package", "name"))
    }

    @Test
    fun `derivePackagePathFromFilePath should NOT prioritize main over dirParts to avoid collisions`() {
        // Given
        val filePath = "some/complex/path/file.go"
        val packageName = listOf("main")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isNotEqualTo(listOf("main"))
        assertThat(result).isEqualTo(listOf("some", "complex", "path"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle invalid package name that starts with main`() {
        // Given
        val filePath = "some/path/file.go"
        val packageName = listOf("main", "extra")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("some", "path"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle file with no extension`() {
        // Given
        val filePath = "some/path/to/file"
        val packageName = listOf("config")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("some", "path", "to", "file"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle single directory with file`() {
        // Given
        val filePath = "config/file.go"
        val packageName = listOf("config")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("config"))
    }

    @Test
    fun `derivePackagePathFromFilePath should handle absolute path`() {
        // Given
        val filePath = "/usr/local/src/project/internal/config/file.go"
        val packageName = listOf("config")

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("usr", "local", "src", "project", "internal", "config"))
    }

    @Test
    fun `derivePackagePathFromFilePath should use directory structure when package name is empty but directory exists`() {
        // Given
        val filePath = "project/internal/config/file.go"
        val packageName = emptyList<String>()

        // When
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Then
        assertThat(result).isEqualTo(listOf("project", "internal", "config"))
    }
}
