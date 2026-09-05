package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.DirectImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class PathAliasResolverTest {
    @Test
    fun `should resolve simple path alias without wildcard`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf("core" to listOf("core"))
            )
        )
        val import = DirectImport("core")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core")))
    }

    @Test
    fun `should resolve path alias with wildcard`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "models")))
    }

    @Test
    fun `should resolve nested path with wildcard`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf("models/*" to listOf("app/models/*"))
            )
        )
        val import = DirectImport("models/user/types")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "app", "models", "user", "types")))
    }

    @Test
    fun `should resolve with @ prefix alias`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = ".",
                paths = mapOf("@app/*" to listOf("src/app/*"))
            )
        )
        val import = DirectImport("@app/components/Button")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "app", "components", "Button")))
    }

    @Test
    fun `should return null for baseUrl fallback when file does not exist`() {
        // Given - baseUrl is set but no explicit path mapping matches
        // baseUrl fallback now requires file existence to prevent claiming module federation imports
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("utils/helpers")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // When
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // Then - returns null because /project/src/utils/helpers doesn't exist
        assertThat(resolved).isNull()
    }

    @Test
    fun `should return null when no baseUrl and no path match`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = null,
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("utils/helpers")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNull()
    }

    @Test
    fun `should return null when config has no compilerOptions`() {
        // given
        val config = TsConfigData(compilerOptions = null)
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNull()
    }

    @Test
    fun `should handle relative baseUrl`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "./src",
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "models")))
    }

    @Test
    fun `should use the first target of a matching path mapping`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf(
                    "core/*" to listOf("core/*", "lib/core/*")
                )
            )
        )
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "models")))
    }

    @Test
    fun `should handle analysis root different from tsconfig dir`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project/frontend")
        val analysisRoot = File("/project/frontend/src")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("core", "models")))
    }

    @Test
    fun `should match exact pattern before wildcard pattern`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf(
                    "core" to listOf("core/index"),
                    "core/*" to listOf("core/*")
                )
            )
        )
        val import = DirectImport("core")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "index")))
    }

    @Test
    fun `should normalize baseUrl with trailing slash`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src/",
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "models")))
    }

    @Test
    fun `should handle baseUrl with leading dot-slash and trailing slash`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "./src/",
                paths = mapOf("core/*" to listOf("core/*"))
            )
        )
        val import = DirectImport("core/models")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "models")))
    }

    @Test
    fun `should not create double slashes in resolved paths`() {
        // given
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = "src",
                paths = mapOf("@app/*" to listOf("app/*"))
            )
        )
        val import = DirectImport("@app/components")
        val tsconfigDir = File("/project")
        val analysisRoot = File("/project")

        // when
        val resolved = PathAliasResolver.resolve(import, config, tsconfigDir, analysisRoot)

        // then
        assertThat(resolved).isNotNull
        assertThat(resolved).isEqualTo(Path(listOf("src", "app", "components")))
        assertThat(resolved.toString()).doesNotContain("//")
    }

    @Test
    fun `should prefer the longest matching prefix over an earlier shorter one`() {
        // Arrange
        val config = TsConfigData(
            compilerOptions = CompilerOptions(
                baseUrl = ".",
                paths = mapOf(
                    "@app/*" to listOf("src/app/*"),
                    "@app/core/*" to listOf("libs/core/*")
                )
            )
        )
        val import = DirectImport("@app/core/x")

        // Act
        val resolved = PathAliasResolver.resolve(import, config, File("/project"), File("/project"))

        // Assert
        assertThat(resolved).isEqualTo(Path(listOf("libs", "core", "x")))
    }

    @Test
    fun `should strip the source extension of an alias target`() {
        // Arrange
        val config = TsConfigData(
            compilerOptions = CompilerOptions(baseUrl = ".", paths = mapOf("@core" to listOf("src/core/index.ts")))
        )

        // Act
        val resolved = PathAliasResolver.resolve(DirectImport("@core"), config, File("/project"), File("/project"))

        // Assert
        assertThat(resolved).isEqualTo(Path(listOf("src", "core", "index")))
    }
}
