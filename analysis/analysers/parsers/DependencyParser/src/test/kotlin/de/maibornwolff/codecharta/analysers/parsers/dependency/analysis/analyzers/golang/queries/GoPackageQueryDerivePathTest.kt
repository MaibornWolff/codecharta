package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterGo

class GoPackageQueryDerivePathTest {
    private val goPackageQuery = GoPackageQuery(TreeSitterGo())

    @Test
    fun `should use directory structure for main packages`() {
        // Given
        val testCases = listOf(
            Triple("cmd/server/main.go", listOf("main"), listOf("cmd", "server")),
            Triple("cmd/cc/main.go", listOf("main"), listOf("cmd", "cc")),
            Triple("internal/tools/main.go", listOf("main"), listOf("internal", "tools")),
            Triple("main.go", listOf("main"), listOf("main")),
            Triple("./main.go", listOf("main"), listOf("main")),
            Triple("some/deep/path/main.go", listOf("main"), listOf("some", "deep", "path"))
        )

        testCases.forEach { (filePath, packageName, expected) ->
            // When
            val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

            // Then
            assertThat(result)
                .withFailMessage("For filePath='$filePath' and packageName=$packageName, expected $expected but got $result")
                .isEqualTo(expected)
        }
    }

    @Test
    fun `should use directory structure for non-main packages`() {
        // Given
        val testCases = listOf(
            Triple("cleaner/module.go", listOf("cleaner"), listOf("cleaner")),
            Triple("internal/core/utils.go", listOf("core"), listOf("internal", "core")),
            Triple("pkg/api/handler.go", listOf("api"), listOf("pkg", "api")),
            Triple("utils.go", listOf("utils"), listOf("utils")),
            Triple("some/path/file.go", listOf("mypackage"), listOf("some", "path"))
        )

        testCases.forEach { (filePath, packageName, expected) ->
            // When
            val result = goPackageQuery.derivePackagePathFromFilePath(filePath, packageName)

            // Then
            assertThat(result)
                .withFailMessage("For filePath='$filePath' and packageName=$packageName, expected $expected but got $result")
                .isEqualTo(expected)
        }
    }

    @Test
    fun `should handle edge cases`() {
        // When/Then - empty package name uses directory
        assertThat(goPackageQuery.derivePackagePathFromFilePath("some/path/file.go", emptyList()))
            .isEqualTo(listOf("some", "path"))

        // When/Then - root file with package uses package name
        assertThat(goPackageQuery.derivePackagePathFromFilePath("file.go", listOf("mypackage")))
            .isEqualTo(listOf("mypackage"))

        // When/Then - directory without extension
        assertThat(goPackageQuery.derivePackagePathFromFilePath("some/path", listOf("mypackage")))
            .isEqualTo(listOf("some", "path"))
    }

    @Test
    fun `should handle Windows-style paths`() {
        // When
        val result = goPackageQuery.derivePackagePathFromFilePath("cmd\\server\\main.go", listOf("main"))

        // Then
        assertThat(result).isEqualTo(listOf("cmd", "server"))
    }

    @Test
    fun `should trim leading dots and slashes`() {
        // Given
        val testCases = listOf(
            "./cmd/server/main.go" to listOf("cmd", "server"),
            "../cmd/server/main.go" to listOf("cmd", "server"),
            "/cmd/server/main.go" to listOf("cmd", "server")
        )

        testCases.forEach { (filePath, expected) ->
            // When
            val result = goPackageQuery.derivePackagePathFromFilePath(filePath, listOf("main"))

            // Then
            assertThat(result)
                .withFailMessage("For filePath='$filePath', expected $expected but got $result")
                .isEqualTo(expected)
        }
    }

    @Test
    fun `should ensure unique paths for different main packages`() {
        // When
        val server = goPackageQuery.derivePackagePathFromFilePath("cmd/server/main.go", listOf("main"))
        val cc = goPackageQuery.derivePackagePathFromFilePath("cmd/cc/main.go", listOf("main"))

        // Then
        assertThat(server).isNotEqualTo(cc)
        assertThat(server).isEqualTo(listOf("cmd", "server"))
        assertThat(cc).isEqualTo(listOf("cmd", "cc"))
    }
}
