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
        // Given
        val sharedDir = tempDir.resolve("shared/src")
        sharedDir.mkdirs()

        val config = BundlerConfigData(
            aliases = mapOf("Shared" to sharedDir.absolutePath)
        )
        val import = DirectImport("Shared")

        // When
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Then
        assertThat(result).isEqualTo(Path(listOf("shared", "src")))
    }

    @Test
    fun `should resolve prefix alias with subpath`() {
        // Given
        val sharedDir = tempDir.resolve("shared/src")
        sharedDir.mkdirs()

        val config = BundlerConfigData(
            aliases = mapOf("Shared" to sharedDir.absolutePath)
        )
        val import = DirectImport("Shared/Utils")

        // When
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Then
        assertThat(result).isEqualTo(Path(listOf("shared", "src", "Utils")))
    }

    @Test
    fun `should return null for unmatched alias`() {
        // Given
        val config = BundlerConfigData(
            aliases = mapOf("Shared" to "/some/path")
        )
        val import = DirectImport("Utils")

        // When
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should not match partial alias names`() {
        // Given
        val config = BundlerConfigData(
            aliases = mapOf("Shared" to "/some/path")
        )
        val import = DirectImport("SharedUtils")

        // When
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should resolve deeply nested subpath`() {
        // Given
        val srcDir = tempDir.resolve("src")
        srcDir.mkdirs()

        val config = BundlerConfigData(
            aliases = mapOf("@" to srcDir.absolutePath)
        )
        val import = DirectImport("@/components/Button/index")

        // When
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Then
        assertThat(result).isEqualTo(Path(listOf("src", "components", "Button", "index")))
    }

    @Test
    fun `should return null for empty config`() {
        // Given
        val config = BundlerConfigData.EMPTY
        val import = DirectImport("Shared")

        // When
        val result = BundlerAliasResolver.resolve(import, config, tempDir)

        // Then
        assertThat(result).isNull()
    }
}
