package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class FederationAliasResolverTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should resolve federated import to producer module`() {
        // Given - monorepo structure with consumer and producer modules
        val modulesDir = tempDir.resolve("modules")
        modulesDir.mkdir()

        // Consumer module
        val consumerDir = modulesDir.resolve("app-main")
        consumerDir.mkdir()
        consumerDir.resolve("package.json").writeText(
            """
            {
              "name": "app-main",
              "federation": {
                "name": "appMain",
                "remotes": {
                  "Shared": "shared@/app/shared/remoteEntry.js"
                }
              }
            }
            """.trimIndent()
        )

        // Producer module
        val producerDir = modulesDir.resolve("shared")
        producerDir.mkdir()
        producerDir.resolve("src").mkdir()
        producerDir.resolve("package.json").writeText(
            """
            {
              "name": "shared",
              "federation": {
                "name": "shared",
                "exposes": {
                  "./Utils": "./src/utils.js"
                }
              }
            }
            """.trimIndent()
        )

        val consumerConfig = FederationConfigResult(
            data = FederationConfigData(
                name = "appMain",
                remotes = mapOf("Shared" to "shared@/app/shared/remoteEntry.js")
            ),
            packageJsonFile = consumerDir.resolve("package.json"),
            moduleDir = consumerDir
        )

        val resolver = FederationConfigResolver()
        val import = DirectImport("Shared/Utils")

        // When
        val result = FederationAliasResolver.resolve(import, consumerConfig, resolver, tempDir)

        // Then
        assertThat(result).isEqualTo(Path(listOf("modules", "shared", "src", "utils")))
    }

    @Test
    fun `should return null for unknown remote`() {
        // Given
        val modulesDir = tempDir.resolve("modules")
        modulesDir.mkdir()

        val consumerDir = modulesDir.resolve("app-main")
        consumerDir.mkdir()

        val consumerConfig = FederationConfigResult(
            data = FederationConfigData(
                name = "appMain",
                remotes = mapOf("Shared" to "shared@/app/shared/remoteEntry.js")
            ),
            packageJsonFile = consumerDir.resolve("package.json"),
            moduleDir = consumerDir
        )

        val resolver = FederationConfigResolver()
        val import = DirectImport("Unknown/Utils")

        // When
        val result = FederationAliasResolver.resolve(import, consumerConfig, resolver, tempDir)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should return null for import without slash`() {
        // Given
        val consumerDir = tempDir.resolve("app-main")
        consumerDir.mkdir()

        val consumerConfig = FederationConfigResult(
            data = FederationConfigData(
                name = "appMain",
                remotes = mapOf("Shared" to "shared@/app/shared/remoteEntry.js")
            ),
            packageJsonFile = consumerDir.resolve("package.json"),
            moduleDir = consumerDir
        )

        val resolver = FederationConfigResolver()
        val import = DirectImport("Shared")

        // When
        val result = FederationAliasResolver.resolve(import, consumerConfig, resolver, tempDir)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should return null when producer module not found`() {
        // Given - only consumer, no producer
        val modulesDir = tempDir.resolve("modules")
        modulesDir.mkdir()

        val consumerDir = modulesDir.resolve("app-main")
        consumerDir.mkdir()
        consumerDir.resolve("package.json").writeText(
            """
            {
              "name": "app-main",
              "federation": {
                "remotes": {
                  "Shared": "shared@/app/shared/remoteEntry.js"
                }
              }
            }
            """.trimIndent()
        )

        val consumerConfig = FederationConfigResult(
            data = FederationConfigData(
                name = "appMain",
                remotes = mapOf("Shared" to "shared@/app/shared/remoteEntry.js")
            ),
            packageJsonFile = consumerDir.resolve("package.json"),
            moduleDir = consumerDir
        )

        val resolver = FederationConfigResolver()
        val import = DirectImport("Shared/Utils")

        // When
        val result = FederationAliasResolver.resolve(import, consumerConfig, resolver, tempDir)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should prefer the producer whose federation name matches over one whose directory is named alike`() {
        // Arrange
        val modulesDir = tempDir.resolve("modules").apply { mkdir() }
        val consumerDir = modulesDir.resolve("app-main").apply { mkdir() }
        modulesDir
            .resolve("shared")
            .apply {
                mkdirs()
                resolve("src").mkdir()
            }.resolve("package.json")
            .writeText(
                """{ "name": "legacy", "federation": { "name": "legacy", "exposes": { "./Utils": "./src/utils.js" } } }"""
            )
        modulesDir
            .resolve("ui")
            .apply {
                mkdirs()
                resolve("src").mkdir()
            }.resolve("package.json")
            .writeText(
                """{ "name": "ui", "federation": { "name": "shared", "exposes": { "./Utils": "./src/utils.js" } } }"""
            )
        val consumerConfig = FederationConfigResult(
            data = FederationConfigData(name = "appMain", remotes = mapOf("Shared" to "shared@/app/shared/remoteEntry.js")),
            packageJsonFile = consumerDir.resolve("package.json"),
            moduleDir = consumerDir
        )

        // Act
        val result = FederationAliasResolver.resolve(DirectImport("Shared/Utils"), consumerConfig, FederationConfigResolver(), tempDir)

        // Assert
        assertThat(result).isEqualTo(Path(listOf("modules", "ui", "src", "utils")))
    }
}
