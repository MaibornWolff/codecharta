package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class TsConfigResolverTest {
    @TempDir
    lateinit var tempDir: File

    private lateinit var resolver: TsConfigResolver

    @BeforeEach
    fun setUp() {
        resolver = TsConfigResolver()
    }

    @Test
    fun `should find tsconfig without extends field`() {
        // given
        val srcDir = tempDir.resolve("src").apply { mkdirs() }
        val tsconfig = srcDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "."
              }
            }
            """.trimIndent()
        )

        val sourceFile = srcDir.resolve("index.ts")

        // when
        val result = resolver.findTsConfig(sourceFile)

        // then
        assertThat(result?.data?.compilerOptions?.baseUrl).isEqualTo(".")
    }

    @Test
    fun `should prefer nearest tsconfig in monorepo`() {
        // given
        val rootTsconfig = tempDir.resolve("tsconfig.json")
        rootTsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "."
              }
            }
            """.trimIndent()
        )

        val packagesDir = tempDir.resolve("packages/frontend").apply { mkdirs() }
        val packageTsconfig = packagesDir.resolve("tsconfig.json")
        packageTsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "src"
              }
            }
            """.trimIndent()
        )

        val sourceFile = packagesDir.resolve("src/index.ts")

        // when
        val result = resolver.findTsConfig(sourceFile)

        // then
        assertThat(result?.data?.compilerOptions?.baseUrl).isEqualTo("src")
    }

    @Test
    fun `should return null when no tsconfig found`() {
        // given
        val srcDir = tempDir.resolve("src").apply { mkdirs() }
        val sourceFile = srcDir.resolve("index.ts")

        // when
        val result = resolver.findTsConfig(sourceFile)

        // then
        assertThat(result).isNull()
    }

    @Test
    fun `should resolve extends to merged configuration`() {
        // given
        val baseTsconfig = tempDir.resolve("tsconfig.base.json")
        baseTsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": ".",
                "paths": {
                  "utils/*": ["utils/*"]
                }
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

        val sourceFile = tempDir.resolve("src/index.ts")

        // when
        val merged = resolver.findTsConfig(sourceFile)

        // then
        assertThat(merged?.data?.compilerOptions?.baseUrl).isEqualTo(".")
        assertThat(merged?.data?.compilerOptions?.paths).containsKeys("core/*", "utils/*")
    }

    @Test
    fun `should override parent baseUrl with child baseUrl`() {
        // given
        val baseTsconfig = tempDir.resolve("tsconfig.base.json")
        baseTsconfig.writeText(
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
                "baseUrl": "src"
              }
            }
            """.trimIndent()
        )

        val sourceFile = tempDir.resolve("index.ts")

        // when
        val merged = resolver.findTsConfig(sourceFile)

        // then
        assertThat(merged?.data?.compilerOptions?.baseUrl).isEqualTo("src")
    }

    @Test
    fun `should handle extends with absolute path`() {
        // given
        val baseTsconfig = tempDir.resolve("config/tsconfig.base.json").apply { parentFile.mkdirs() }
        baseTsconfig.writeText(
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
              "extends": "${baseTsconfig.invariantSeparatorsPath}",
              "compilerOptions": {
                "paths": {
                  "core/*": ["core/*"]
                }
              }
            }
            """.trimIndent()
        )

        val sourceFile = tempDir.resolve("src/index.ts")

        // when
        val merged = resolver.findTsConfig(sourceFile)

        // then - the parent's baseUrl points at the parent's own directory, expressed relative to the child
        assertThat(merged?.data?.compilerOptions?.baseUrl).isEqualTo("config")
        assertThat(merged?.data?.compilerOptions?.paths).containsKey("core/*")
    }

    @Test
    fun `should return null for extends with non-existent file`() {
        // given
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "extends": "./nonexistent.json"
            }
            """.trimIndent()
        )

        val sourceFile = tempDir.resolve("src/index.ts")

        // when
        val merged = resolver.findTsConfig(sourceFile)

        // then
        assertThat(merged?.data?.compilerOptions).isNull()
    }

    @Test
    fun `should cache tsconfig lookups for performance`() {
        // given
        val tsconfig = tempDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "src"
              }
            }
            """.trimIndent()
        )

        val file1 = tempDir.resolve("src/file1.ts")
        val file2 = tempDir.resolve("src/file2.ts")

        // when
        val result1 = resolver.findTsConfig(file1)
        val result2 = resolver.findTsConfig(file2)

        // then
        assertThat(result1?.data).isSameAs(result2?.data)
    }

    @Test
    fun `should find jsconfig when tsconfig does not exist`() {
        // Given
        val srcDir = tempDir.resolve("src").apply { mkdirs() }
        val jsconfig = srcDir.resolve("jsconfig.json")
        jsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "./",
                "paths": {
                  "@/*": ["src/*"]
                }
              }
            }
            """.trimIndent()
        )

        val sourceFile = srcDir.resolve("index.js")

        // When
        val result = resolver.findTsConfig(sourceFile)

        // Then
        assertThat(result?.data?.compilerOptions?.baseUrl).isEqualTo("./")
        assertThat(result?.data?.compilerOptions?.paths).containsKey("@/*")
        assertThat(
            result
                ?.data
                ?.compilerOptions
                ?.paths
                ?.get("@/*")
        ).containsExactly("src/*")
    }

    @Test
    fun `should prefer tsconfig over jsconfig when both exist`() {
        // Given
        val srcDir = tempDir.resolve("src").apply { mkdirs() }

        val jsconfig = srcDir.resolve("jsconfig.json")
        jsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "js-base"
              }
            }
            """.trimIndent()
        )

        val tsconfig = srcDir.resolve("tsconfig.json")
        tsconfig.writeText(
            """
            {
              "compilerOptions": {
                "baseUrl": "ts-base"
              }
            }
            """.trimIndent()
        )

        val sourceFile = srcDir.resolve("index.ts")

        // When
        val result = resolver.findTsConfig(sourceFile)

        // Then
        assertThat(result?.data?.compilerOptions?.baseUrl).isEqualTo("ts-base")
        assertThat(result?.file?.name).isEqualTo("tsconfig.json")
    }

    @Test
    fun `should resolve an inherited baseUrl relative to the config that defines it`() {
        // Arrange
        tempDir
            .resolve(
                "tsconfig.base.json"
            ).writeText("""{ "compilerOptions": { "baseUrl": ".", "paths": { "@org/ui/*": ["libs/ui/src/*"] } } }""")
        val appDir = tempDir.resolve("apps/web").apply { mkdirs() }
        appDir.resolve("tsconfig.json").writeText("""{ "extends": "../../tsconfig.base.json" }""")

        // Act
        val merged = resolver.findTsConfig(appDir.resolve("src/main.ts"))

        // Assert
        assertThat(merged?.data?.compilerOptions?.baseUrl).isEqualTo("../..")
        assertThat(merged?.data?.compilerOptions?.paths).containsEntry("@org/ui/*", listOf("libs/ui/src/*"))
    }

    @Test
    fun `should resolve inherited paths without a baseUrl relative to the config that defines them`() {
        // Arrange
        tempDir.resolve("tsconfig.base.json").writeText("""{ "compilerOptions": { "paths": { "@org/ui/*": ["libs/ui/src/*"] } } }""")
        val appDir = tempDir.resolve("apps/web").apply { mkdirs() }
        appDir
            .resolve(
                "tsconfig.json"
            ).writeText("""{ "extends": "../../tsconfig.base.json", "compilerOptions": { "paths": { "@app/*": ["src/*"] } } }""")

        // Act
        val merged = resolver.findTsConfig(appDir.resolve("src/main.ts"))

        // Assert
        assertThat(merged?.data?.compilerOptions?.baseUrl).isNull()
        assertThat(merged?.data?.compilerOptions?.paths).containsEntry("@org/ui/*", listOf("../../libs/ui/src/*"))
        assertThat(merged?.data?.compilerOptions?.paths).containsEntry("@app/*", listOf("src/*"))
    }

    @Test
    fun `should find the parent of an extends that omits the json extension`() {
        // Arrange
        tempDir.resolve("tsconfig.base.json").writeText("""{ "compilerOptions": { "baseUrl": "." } }""")
        tempDir.resolve("tsconfig.json").writeText("""{ "extends": "./tsconfig.base" }""")

        // Act
        val merged = resolver.findTsConfig(tempDir.resolve("src/index.ts"))

        // Assert
        assertThat(merged?.data?.compilerOptions?.baseUrl).isEqualTo(".")
    }
}
