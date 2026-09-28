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
    fun `should return directory path when packageName is main`() {
        // Arrange
        val filePath = "some/path/to/file.go"
        val packageName = listOf("main")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("some", "path", "to"))
    }

    @Test
    fun `should return dirParts when packageName is not main and dirParts exist`() {
        // Arrange
        val filePath = "project/internal/config/file.go"
        val packageName = listOf("config")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("project", "internal", "config"))
    }

    @Test
    fun `should return packageName when dirParts empty and packageName not empty and not main`() {
        // Arrange
        val filePath = "file.go" // no directory structure
        val packageName = listOf("somepackage")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("somepackage"))
    }

    @Test
    fun `should return unknown when both dirParts and packageName are empty`() {
        // Arrange
        val filePath = "file.go" // no directory structure
        val packageName = emptyList<String>()

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("unknown"))
    }

    @Test
    fun `should return unknown when dirParts empty and packageName empty despite having a path`() {
        // Arrange
        val filePath = "" // empty path
        val packageName = emptyList<String>()

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("unknown"))
    }

    @Test
    fun `should handle complex nested paths`() {
        // Arrange
        val filePath = "github.com/myuser/myproject/internal/service/handler/user.go"
        val packageName = listOf("handler")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("github.com", "myuser", "myproject", "internal", "service", "handler"))
    }

    @Test
    fun `should handle Windows-style paths`() {
        // Arrange
        val filePath = "project\\internal\\config\\file.go"
        val packageName = listOf("config")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("project", "internal", "config"))
    }

    @Test
    fun `should handle packageName with multiple elements but not main`() {
        // Arrange
        val filePath = "file.go" // no directory structure
        val packageName = listOf("complex", "package", "name")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("complex", "package", "name"))
    }

    @Test
    fun `should not prioritize main over dirParts to avoid collisions`() {
        // Arrange
        val filePath = "some/complex/path/file.go"
        val packageName = listOf("main")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isNotEqualTo(listOf("main"))
        assertThat(result).isEqualTo(listOf("some", "complex", "path"))
    }

    @Test
    fun `should handle invalid package name that starts with main`() {
        // Arrange
        val filePath = "some/path/file.go"
        val packageName = listOf("main", "extra")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("some", "path"))
    }

    @Test
    fun `should handle file with no extension`() {
        // Arrange
        val filePath = "some/path/to/file"
        val packageName = listOf("config")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("some", "path", "to", "file"))
    }

    @Test
    fun `should handle single directory with file`() {
        // Arrange
        val filePath = "config/file.go"
        val packageName = listOf("config")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("config"))
    }

    @Test
    fun `should handle absolute path`() {
        // Arrange
        val filePath = "/usr/local/src/project/internal/config/file.go"
        val packageName = listOf("config")

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("usr", "local", "src", "project", "internal", "config"))
    }

    @Test
    fun `should use directory structure when package name is empty but directory exists`() {
        // Arrange
        val filePath = "project/internal/config/file.go"
        val packageName = emptyList<String>()

        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

        // Assert
        assertThat(result).isEqualTo(listOf("project", "internal", "config"))
    }
}
