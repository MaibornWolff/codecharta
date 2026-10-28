package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class WorkspacePackagesTest {
    private fun File.withPackage(folder: String, name: String): File {
        resolve("$folder/package.json").also { it.parentFile.mkdirs() }.writeText("""{ "name": "$name" }""")
        return this
    }

    @Test
    fun `should find the folder of the package a bare specifier names`(
        @TempDir root: File
    ) {
        // Arrange
        root.withPackage("packages/core", "@acme/core")

        // Act
        val path = WorkspacePackages.of(root).pathOf("@acme/core")

        // Assert
        assertThat(path).isEqualTo(root.resolve("packages/core"))
    }

    @Test
    fun `should find the path below the package a subpath names, the longest package name first`(
        @TempDir root: File
    ) {
        // Arrange
        root.withPackage("packages/core", "@acme/core").withPackage("packages/core-model", "@acme/core/model")

        // Act
        val packages = WorkspacePackages.of(root)

        // Assert
        assertThat(packages.pathOf("@acme/core/model/user")).isEqualTo(root.resolve("packages/core-model/user"))
        assertThat(packages.pathOf("@acme/core/store")).isEqualTo(root.resolve("packages/core/store"))
    }

    @Test
    fun `should find no package for a library and none inside node_modules`(
        @TempDir root: File
    ) {
        // Arrange
        root.withPackage("node_modules/lodash", "lodash").withPackage("app", "app")

        // Act
        val packages = WorkspacePackages.of(root)

        // Assert
        assertThat(packages.pathOf("lodash")).isNull()
        assertThat(packages.pathOf("@acme/core")).isNull()
    }

    @Test
    fun `should take the shallower of two packages of one name`(
        @TempDir root: File
    ) {
        // Arrange
        root.withPackage("packages/core/dist", "@acme/core").withPackage("packages/core", "@acme/core")

        // Act
        val path = WorkspacePackages.of(root).pathOf("@acme/core")

        // Assert
        assertThat(path).isEqualTo(root.resolve("packages/core"))
    }
}
