package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class BundlerAliasResolverTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should resolve exact alias match`() {
        // Arrange
        val sharedDir = tempDir.resolve("shared/src")
        sharedDir.mkdirs()

        val config = BundlerConfigData(
            aliases = mapOf("Shared" to sharedDir.absolutePath)
        )
        val import = DirectImport("Shared")

        // Act
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Assert
        assertThat(result).isEqualTo(Path(listOf("shared", "src")))
    }

    @Test
    fun `should resolve prefix alias with subpath`() {
        // Arrange
        val sharedDir = tempDir.resolve("shared/src")
        sharedDir.mkdirs()

        val config = BundlerConfigData(
            aliases = mapOf("Shared" to sharedDir.absolutePath)
        )
        val import = DirectImport("Shared/Utils")

        // Act
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Assert
        assertThat(result).isEqualTo(Path(listOf("shared", "src", "Utils")))
    }

    @Test
    fun `should return null for unmatched alias`() {
        // Arrange
        val config = BundlerConfigData(
            aliases = mapOf("Shared" to "/some/path")
        )
        val import = DirectImport("Utils")

        // Act
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should not match partial alias names`() {
        // Arrange
        val config = BundlerConfigData(
            aliases = mapOf("Shared" to "/some/path")
        )
        val import = DirectImport("SharedUtils")

        // Act
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should resolve deeply nested subpath`() {
        // Arrange
        val srcDir = tempDir.resolve("src")
        srcDir.mkdirs()

        val config = BundlerConfigData(
            aliases = mapOf("@" to srcDir.absolutePath)
        )
        val import = DirectImport("@/components/Button/index")

        // Act
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Assert
        assertThat(result).isEqualTo(Path(listOf("src", "components", "Button", "index")))
    }

    @Test
    fun `should return null for empty config`() {
        // Arrange
        val config = BundlerConfigData.EMPTY
        val import = DirectImport("Shared")

        // Act
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should strip the source extension of an alias target`() {
        // Arrange
        val config = BundlerConfigData(aliases = mapOf("@core" to tempDir.resolve("src/core/index.ts").absolutePath))

        // Act
        val result = BundlerAliasResolver.resolve(DirectImport("@core"), config, tempDir)

        // Assert
        assertThat(result).isEqualTo(Path(listOf("src", "core", "index")))
    }
}
