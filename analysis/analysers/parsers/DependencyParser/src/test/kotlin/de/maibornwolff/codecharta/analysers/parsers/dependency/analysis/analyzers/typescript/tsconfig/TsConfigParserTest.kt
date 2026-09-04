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
        // given
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

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.baseUrl).isEqualTo("src")
        assertThat(result?.compilerOptions?.paths).containsKeys("core/*", "models/*")
        assertThat(result?.compilerOptions?.paths?.get("core/*")).containsExactly("core/*")
    }

    @Test
    fun `should parse tsconfig with only baseUrl`() {
        // given
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

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.baseUrl).isEqualTo("./src")
        assertThat(result?.compilerOptions?.paths).isNull()
    }

    @Test
    fun `should parse tsconfig with only paths`() {
        // given
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

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.baseUrl).isNull()
        assertThat(result?.compilerOptions?.paths).containsKey("@app/*")
    }

    @Test
    fun `should parse tsconfig with extends field`() {
        // given
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

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.extends).isEqualTo("./tsconfig.base.json")
        assertThat(result?.compilerOptions?.paths).containsKey("core/*")
    }

    @Test
    fun `should return null for non-existent file`() {
        // given
        val tsconfig = tempDir.resolve("nonexistent.json")

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNull()
    }

    @Test
    fun `should return null for malformed JSON`() {
        // given
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

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNull()
    }

    @Test
    fun `should parse empty tsconfig`() {
        // given
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText("{}")

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions).isNull()
        assertThat(result?.extends).isNull()
    }

    @Test
    fun `should parse tsconfig without compilerOptions`() {
        // given
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "include": ["src/**/*"],
              "exclude": ["node_modules"]
            }
            """.trimIndent()
        )

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions).isNull()
    }

    @Test
    fun `should handle multiple path mappings for same pattern`() {
        // given
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

        // when
        val result = TsConfigParser.parse(tsconfig)

        // then
        assertThat(result).isNotNull
        assertThat(result?.compilerOptions?.paths?.get("@lib/*"))
            .containsExactly("lib/src/*", "lib/dist/*")
    }
}
