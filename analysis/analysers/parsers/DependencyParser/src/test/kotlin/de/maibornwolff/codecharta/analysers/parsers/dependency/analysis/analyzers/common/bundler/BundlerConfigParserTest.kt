package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.bundler

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class BundlerConfigParserTest {
    @TempDir
    lateinit var tempDir: File

    @Test
    fun `should parse webpack config with CommonJS module exports`() {
        // Arrange
        val webpackConfig = tempDir.resolve("webpack.config.js")
        webpackConfig.writeText(
            """
            const path = require('path');

            module.exports = {
              resolve: {
                alias: {
                  '@': './src',
                  'Shared': './shared/src'
                }
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(webpackConfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.aliases).containsEntry("@", "./src")
        assertThat(result?.aliases).containsEntry("Shared", "./shared/src")
    }

    @Test
    fun `should parse vite config with ES module export default`() {
        // Arrange
        val viteConfig = tempDir.resolve("vite.config.js")
        viteConfig.writeText(
            """
            import { defineConfig } from 'vite';

            export default {
              resolve: {
                alias: {
                  '@': '/src',
                  'components': '/src/components'
                }
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(viteConfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.aliases).containsEntry("@", "/src")
        assertThat(result?.aliases).containsEntry("components", "/src/components")
    }

    @Test
    fun `should parse vue config with configureWebpack`() {
        // Arrange
        val vueConfig = tempDir.resolve("vue.config.js")
        vueConfig.writeText(
            """
            module.exports = {
              configureWebpack: {
                resolve: {
                  alias: {
                    'Shared': './shared/src'
                  }
                }
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(vueConfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.aliases).containsEntry("Shared", "./shared/src")
    }

    @Test
    fun `should resolve path resolve with dirname`() {
        // Arrange
        val webpackConfig = tempDir.resolve("webpack.config.js")
        webpackConfig.writeText(
            """
            const path = require('path');

            module.exports = {
              resolve: {
                alias: {
                  '@': path.resolve(__dirname, 'src')
                }
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(webpackConfig)

        // Assert
        assertThat(result).isNotNull
        val expectedPath = tempDir.resolve("src").canonicalPath
        assertThat(result?.aliases?.get("@")).isEqualTo(expectedPath)
    }

    @Test
    fun `should resolve path resolve with multiple segments`() {
        // Arrange
        val webpackConfig = tempDir.resolve("webpack.config.js")
        webpackConfig.writeText(
            """
            const path = require('path');

            module.exports = {
              resolve: {
                alias: {
                  'Shared': path.resolve(__dirname, 'packages', 'shared', 'src')
                }
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(webpackConfig)

        // Assert
        assertThat(result).isNotNull
        val expectedPath = tempDir.resolve("packages/shared/src").canonicalPath
        assertThat(result?.aliases?.get("Shared")).isEqualTo(expectedPath)
    }

    @Test
    fun `should return null for non-existent file`() {
        // Arrange
        val webpackConfig = tempDir.resolve("nonexistent.js")

        // Act
        val result = BundlerConfigParser.parse(webpackConfig)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should return null for config without aliases`() {
        // Arrange
        val webpackConfig = tempDir.resolve("webpack.config.js")
        webpackConfig.writeText(
            """
            module.exports = {
              entry: './src/index.js',
              output: {
                filename: 'bundle.js'
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(webpackConfig)

        // Assert
        assertThat(result).isNull()
    }

    @Test
    fun `should handle quoted property keys`() {
        // Arrange
        val webpackConfig = tempDir.resolve("webpack.config.js")
        webpackConfig.writeText(
            """
            module.exports = {
              resolve: {
                alias: {
                  '@components': './src/components',
                  'shared-utils': './shared/utils'
                }
              }
            };
            """.trimIndent()
        )

        // Act
        val result = BundlerConfigParser.parse(webpackConfig)

        // Assert
        assertThat(result).isNotNull
        assertThat(result?.aliases).containsEntry("@components", "./src/components")
        assertThat(result?.aliases).containsEntry("shared-utils", "./shared/utils")
    }
}
