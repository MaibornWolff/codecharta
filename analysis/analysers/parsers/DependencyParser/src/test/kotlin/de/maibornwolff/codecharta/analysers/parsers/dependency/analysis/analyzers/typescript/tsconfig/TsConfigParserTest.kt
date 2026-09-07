package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class TsConfigParserTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should parse tsconfig with baseUrl and paths`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "src",
                "paths": {
                  "core/*": ["core/*"],
                  "models/*": ["models/*"]
                }
              }
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.baseUrl).isEqualTo("src")
        assertThat(result?.compilerOptions?.paths).containsKeys("core/*", "models/*")
        assertThat(result?.compilerOptions?.paths?.get("core/*")).containsExactly("core/*")
    }

    @Test
    fun `should parse tsconfig with only baseUrl`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "./src"
              }
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.baseUrl).isEqualTo("./src")
        assertThat(result?.compilerOptions?.paths).isNull()
    }

    @Test
    fun `should parse tsconfig with only paths`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "paths": {
                  "@app/*": ["src/app/*"]
                }
              }
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.baseUrl).isNull()
        assertThat(result?.compilerOptions?.paths).containsKey("@app/*")
    }

    @Test
    fun `should parse tsconfig with extends field`() {
        // Arrange
        val parentTsconfig = tempDir.resolve("tsconfig.base.json")
        parentTsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "."
              }
            }
            """.trimIndent()
        )

        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "extends": "./tsconfig.base.json",
              "compilerOptions": {
                "paths": {
                  "core/*": ["core/*"]
                }
              }
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.extends).isEqualTo("./tsconfig.base.json")
        assertThat(result?.compilerOptions?.paths).containsKey("core/*")
    }

    @Test
    fun `should return null for non-existent file`() {
        // Arrange
        val tsconfig = tempDir.resolve("nonexistent.json")

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should return null for malformed JSON`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "src"
              invalid json
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should parse empty tsconfig`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText("{}")

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions).isNull()
        assertThat(result?.extends).isNull()
    }

    @Test
    fun `should parse tsconfig without compilerOptions`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "include": ["src/**/*"],
              "exclude": ["node_modules"]
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions).isNull()
    }

    @Test
    fun `should handle multiple path mappings for same pattern`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": ".",
                "paths": {
                  "@lib/*": ["lib/src/*", "lib/dist/*"]
                }
              }
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.paths?.get("@lib/*"))
            .containsExactly("lib/src/*", "lib/dist/*")
    }

    @Test
    fun `should drop the null a trailing comma in a paths array reads as`() {
        // Arrange
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              // comments are allowed too
              "compilerOptions": {
                "paths": {
                  "core/*": ["core/*",]
                }
              }
            }
            """.trimIndent()
        )

        // Act
        val result = TsConfigParser.parse(tsconfig)

        // Assert
        assertThat(result?.compilerOptions?.paths?.get("core/*")).containsExactly("core/*")
    }
}
