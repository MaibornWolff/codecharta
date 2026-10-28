package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class PythonModulesTest {
    private fun File.withFiles(vararg paths: String): File {
        paths.forEach { path -> resolve(path).also { it.parentFile.mkdirs() }.writeText("") }
        return this
    }

    private fun path(dotted: String) = dotted.split(".")

    @Test
    fun `should find a module below the analysis root`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("app/__init__.py", "app/models/user.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("app.models.user"), listOf("app"))

        // Assert
        assertThat(modules).containsExactly(listOf("app", "models", "user"))
    }

    @Test
    fun `should find a module below the folder that holds a top-level package`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("proj/src/app/__init__.py", "proj/src/app/core.py", "proj/tests/test_core.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("app.core"), listOf("proj", "tests"))

        // Assert
        assertThat(modules).containsExactly(listOf("proj", "src", "app", "core"))
    }

    @Test
    fun `should find a module below the folder of the importing file`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("scripts/helper.py", "scripts/run.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("helper"), listOf("scripts"))

        // Assert
        assertThat(modules).containsExactly(listOf("scripts", "helper"))
    }

    @Test
    fun `should list the module below the root nearest to the importing file first`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("app/__init__.py", "app/models.py", "svc/app/__init__.py", "svc/app/models.py")

        // Act
        val fromService = PythonModules.of(root).modulesOf(path("app.models"), listOf("svc", "app"))
        val fromTop = PythonModules.of(root).modulesOf(path("app.models"), listOf("app"))

        // Assert
        assertThat(fromService).containsExactly(listOf("svc", "app", "models"), listOf("app", "models"))
        assertThat(fromTop).containsExactly(listOf("app", "models"), listOf("svc", "app", "models"))
    }

    @Test
    fun `should take a package before a module of the same name`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("app/__init__.py", "app/models.py", "app/models/__init__.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("app.models"), listOf("app"))

        // Assert
        assertThat(modules).containsExactly(listOf("app", "models", "__init__"))
    }

    @Test
    fun `should find a namespace package as its folder`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("svc/app/__init__.py", "svc/app/models.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("svc"), emptyList())

        // Assert
        assertThat(modules).containsExactly(listOf("svc"))
    }

    @Test
    fun `should fall back to the module the path ends with in at least two segments`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("svc/app/core.py", "svc/app/main.py", "lib/util.py")

        // Act
        val twoSegments = PythonModules.of(root).modulesOf(path("app.core"), listOf("svc", "app"))
        val oneSegment = PythonModules.of(root).modulesOf(path("util"), listOf("svc", "app"))

        // Assert
        assertThat(twoSegments).containsExactly(listOf("svc", "app", "core"))
        assertThat(oneSegment).isEmpty()
    }

    @Test
    fun `should find no module for a library`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles("app/__init__.py", "tools/logging.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("logging"), listOf("app"))

        // Assert
        assertThat(modules).isEmpty()
    }

    @Test
    fun `should not look into hidden folders`(
        @TempDir root: File
    ) {
        // Arrange
        root.withFiles(".venv/app/__init__.py", ".venv/app/models.py")

        // Act
        val modules = PythonModules.of(root).modulesOf(path("app.models"), emptyList())

        // Assert
        assertThat(modules).isEmpty()
    }
}
