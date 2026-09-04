package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.federation

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class FederationConfigParserTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should parse package json with federation remotes`() {
        // Given
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "app-main",
              "federation": {
                "name": "appMain",
                "remotes": {
                  "Shared": "shared@/app/shared/remoteEntry.js",
                  "Core": "core@/app/core/remoteEntry.js"
                }
              }
            }
            """.trimIndent()
        )

        // When
        val result = FederationConfigParser.parse(packageJson)

        // Then
        assertThat(result).isNotNull
        assertThat(result?.name).isEqualTo("appMain")
        assertThat(result?.remotes).containsEntry("Shared", "shared@/app/shared/remoteEntry.js")
        assertThat(result?.remotes).containsEntry("Core", "core@/app/core/remoteEntry.js")
    }

    @Test
    fun `should parse package json with federation exposes`() {
        // Given
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "shared",
              "federation": {
                "name": "shared",
                "exposes": {
                  "./Utils": "./src/utils.js",
                  "./Components": "./src/components/index.js"
                }
              }
            }
            """.trimIndent()
        )

        // When
        val result = FederationConfigParser.parse(packageJson)

        // Then
        assertThat(result).isNotNull
        assertThat(result?.name).isEqualTo("shared")
        assertThat(result?.exposes).containsEntry("./Utils", "./src/utils.js")
        assertThat(result?.exposes).containsEntry("./Components", "./src/components/index.js")
    }

    @Test
    fun `should return null for package json without federation`() {
        // Given
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "simple-package",
              "version": "1.0.0"
            }
            """.trimIndent()
        )

        // When
        val result = FederationConfigParser.parse(packageJson)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should return null for non-existent file`() {
        // Given
        val packageJson = tempDir.resolve("nonexistent.json")

        // When
        val result = FederationConfigParser.parse(packageJson)

        // Then
        assertThat(result).isNull()
    }

    @Test
    fun `should return null for malformed JSON`() {
        // Given
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText("{ invalid json }")

        // When
        val result = FederationConfigParser.parse(packageJson)

        // Then
        assertThat(result).isNull()
    }
}
