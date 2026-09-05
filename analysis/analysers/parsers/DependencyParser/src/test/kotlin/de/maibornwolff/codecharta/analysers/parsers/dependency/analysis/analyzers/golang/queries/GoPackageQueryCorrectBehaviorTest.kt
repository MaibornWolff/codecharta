package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterGo

class GoPackageQueryCorrectBehaviorTest {
    private val goPackageQuery = GoPackageQuery(TreeSitterGo())

    @Test
    fun `should use the directory path for main packages to prevent collisions`() {
        // Act
        val serverMain = goPackageQuery.derivePackagePathFromFilePath("cmd/server/main.go", listOf("main"))
        val ccMain = goPackageQuery.derivePackagePathFromFilePath("cmd/cc/main.go", listOf("main"))

        // Assert
        assertThat(serverMain).isNotEqualTo(ccMain)
        assertThat(serverMain).isEqualTo(listOf("cmd", "server"))
        assertThat(ccMain).isEqualTo(listOf("cmd", "cc"))
    }

    @Test
    fun `should use the directory path for regular packages for consistency with imports`() {
        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath("project/internal/utils/helper.go", listOf("utils"))

        // Assert
        assertThat(result).isEqualTo(listOf("project", "internal", "utils"))
    }

    @Test
    fun `should use the package name for root level files`() {
        // Act
        val mainInRoot = goPackageQuery.derivePackagePathFromFilePath("main.go", listOf("main"))
        val pkgInRoot = goPackageQuery.derivePackagePathFromFilePath("utils.go", listOf("utils"))

        // Assert
        assertThat(mainInRoot).isEqualTo(listOf("main"))
        assertThat(pkgInRoot).isEqualTo(listOf("utils"))
    }

    @Test
    fun `should derive distinct paths for main packages in different directories`() {
        // Arrange
        val paths = listOf(
            "cmd/server/main.go",
            "cmd/cli/main.go",
            "tools/gen/main.go",
            "examples/basic/main.go"
        )

        // Act
        val results = paths.map { path ->
            goPackageQuery.derivePackagePathFromFilePath(path, listOf("main"))
        }

        // Assert
        assertThat(results.distinct()).hasSize(results.size)
        assertThat(results).containsExactly(
            listOf("cmd", "server"),
            listOf("cmd", "cli"),
            listOf("tools", "gen"),
            listOf("examples", "basic")
        )
    }
}
