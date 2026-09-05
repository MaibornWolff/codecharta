package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.treesitter.TreeSitterGo

class GoPackageQueryCorrectBehaviorTest {
    private val goPackageQuery = GoPackageQuery(TreeSitterGo())

    @Test
    fun `main packages must use directory path to prevent collisions`() {
        // Act
        val serverMain = goPackageQuery.derivePackagePathFromFilePath("cmd/server/main.go", listOf("main"))
        val ccMain = goPackageQuery.derivePackagePathFromFilePath("cmd/cc/main.go", listOf("main"))

        // Assert
        assertThat(serverMain).isNotEqualTo(ccMain)
        assertThat(serverMain).isEqualTo(listOf("cmd", "server"))
        assertThat(ccMain).isEqualTo(listOf("cmd", "cc"))
    }

    @Test
    fun `regular packages should use directory for consistency with imports`() {
        // Act
        val result = goPackageQuery.derivePackagePathFromFilePath("project/internal/utils/helper.go", listOf("utils"))

        // Assert
        assertThat(result).isEqualTo(listOf("project", "internal", "utils"))
    }

    @Test
    fun `root level files need special handling`() {
        // Act
        val mainInRoot = goPackageQuery.derivePackagePathFromFilePath("main.go", listOf("main"))
        val pkgInRoot = goPackageQuery.derivePackagePathFromFilePath("utils.go", listOf("utils"))

        // Assert
        assertThat(mainInRoot).isEqualTo(listOf("main"))
        assertThat(pkgInRoot).isEqualTo(listOf("utils"))
    }

    @Test
    fun `the old behavior would cause collisions - this test shows why it was wrong`() {
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
