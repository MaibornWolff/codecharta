package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class GoModulesTest {
    private fun File.withFile(path: String, content: String = ""): File {
        resolve(path).also { it.parentFile.mkdirs() }.writeText(content)
        return this
    }

    private fun importPath(path: String) = path.split("/")

    @Test
    fun `should map an import path onto the folder of the module whose path it starts with`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("go.mod", "module example.com/shop\n").withFile("util/util.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("example.com/shop/util"), listOf("app"))

        // Assert
        assertThat(folder).containsExactly("util")
    }

    @Test
    fun `should read a module path in quotes and before a comment`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("lib/go.mod", "// leading comment\nmodule \"example.com/lib\" // trailing comment\n").withFile("lib/util/u.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("example.com/lib/util"), listOf("app"))

        // Assert
        assertThat(folder).containsExactly("lib", "util")
    }

    @Test
    fun `should take the module with the longest matching path`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("go.mod", "module example.com/app\n").withFile("plugin/x/x.go")
        root.withFile("ext/go.mod", "module example.com/app/plugin\n").withFile("ext/x/x.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("example.com/app/plugin/x"), listOf("cmd"))

        // Assert
        assertThat(folder).containsExactly("ext", "x")
    }

    @Test
    fun `should match a module path in whole segments only`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("shop/go.mod", "module example.com/shop\n").withFile("shop/x/domain/d.go")
        root.withFile("shopx/go.mod", "module example.com/shopx\n").withFile("shopx/domain/d.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("example.com/shopx/domain"), listOf("shop", "app"))

        // Assert
        assertThat(folder).containsExactly("shopx", "domain")
    }

    @Test
    fun `should find a vendored package below the module of the importing file`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("go.mod", "module example.com/m\n").withFile("vendor/gopkg.in/yaml.v3/yaml.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("gopkg.in/yaml.v3"), listOf("app"))

        // Assert
        assertThat(folder).containsExactly("vendor", "gopkg.in", "yaml.v3")
    }

    @Test
    fun `should mean a library for an import path of no module from a file of a module`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("go.mod", "module example.com/m\n").withFile("google/uuid/uuid.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("github.com/google/uuid"), listOf("app"))

        // Assert
        assertThat(folder).isNull()
    }

    @Test
    fun `should take the folder the import path ends with in two segments for a file under no go mod`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("domain/model/rider.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("example.com/shop/domain/model"), listOf("app"))

        // Assert
        assertThat(folder).containsExactly("domain", "model")
    }

    @Test
    fun `should not take a folder the import path ends with in one segment only`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFile("util/util.go")

        // Act
        val folder = GoModules.of(root).folderOf(importPath("example.com/shop/util"), listOf("app"))

        // Assert
        assertThat(folder).isNull()
    }

    @Test
    fun `should read the package name from the package clause of a file that is no test`(
        @TempDir root: File
    ) {
        // Arrange
        root
            .withFile(
                "mismatch-dir/a_test.go",
                "package mismatched_test\n"
            ).withFile("mismatch-dir/m.go", "// Package doc\npackage mismatched\n")

        // Act
        val packageName = GoModules.of(root).packageNameOf(listOf("mismatch-dir"))

        // Assert
        assertThat(packageName).isEqualTo("mismatched")
    }
}
