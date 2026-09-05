package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

/**
 * End-to-end regression guard for config-based import alias resolution.
 *
 * Alias resolution (tsconfig/jsconfig `paths`, bundler aliases) was silently lost during the
 * TSE migration: aliased imports passed through unresolved and dropped out of the graph. These
 * tests run the full analyzer against on-disk config fixtures and assert the aliased imports
 * resolve to the correct internal module paths — independently of `/dc-compare`.
 */
class ImportAliasResolutionTest {
    @Test
    fun `should resolve tsconfig path alias imports to internal module paths`() {
        // Given - a project root containing tsconfig.json with `paths` aliases
        val analysisRoot = File("src/test/resources/typescript-alias")
        assumeTrue(analysisRoot.exists())
        val typescriptCode = """
            import { SharedLogger } from '@shared/logger'
            import { UserService } from '@app/userService'

            export class AliasConsumer {
                private logger = new SharedLogger()
                private users = new UserService()
            }
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "src/alias-consumer.ts",
                typescriptCode,
                analysisRoot = analysisRoot
            )
        ).analyze()

        // Then - "@shared/*" -> "src/shared/*" and "@app/*" -> "src/app/*" resolve to real modules
        val node = report.nodes.first { it.pathWithName.getName() == "AliasConsumer" }
        assertThat(node.dependencies).contains(
            Dependency(path = Path(listOf("src", "shared", "logger", "SharedLogger"))),
            Dependency(path = Path(listOf("src", "app", "userService", "UserService")))
        )
    }

    @Test
    fun `should resolve webpack bundler alias imports to internal module paths`() {
        // Given - a project root containing webpack.config.js with a resolve.alias mapping
        val analysisRoot = File("src/test/resources/bundler-alias")
        assumeTrue(analysisRoot.exists())
        val typescriptCode = """
            import { Calculator } from '@utils/calculator'

            export class BundlerConsumer {
                private calc = new Calculator()
            }
        """.trimIndent()

        // When
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "src/bundler-consumer.ts",
                typescriptCode,
                analysisRoot = analysisRoot
            )
        ).analyze()

        // Then - "@utils" -> "<root>/src/utils" resolves to the real module
        val node = report.nodes.first { it.pathWithName.getName() == "BundlerConsumer" }
        assertThat(node.dependencies).contains(
            Dependency(path = Path(listOf("src", "utils", "calculator", "Calculator")))
        )
    }

    @Test
    fun `should resolve a path alias inherited from a workspace root tsconfig`(
        @TempDir analysisRoot: File
    ) {
        // Arrange - an Nx-style workspace: the root defines the aliases, the app only extends it
        analysisRoot
            .resolve(
                "tsconfig.base.json"
            ).writeText("""{ "compilerOptions": { "baseUrl": ".", "paths": { "@org/ui/*": ["libs/ui/src/*"] } } }""")
        analysisRoot.resolve("apps/web/src").mkdirs()
        analysisRoot.resolve("apps/web/tsconfig.json").writeText("""{ "extends": "../../tsconfig.base.json" }""")
        analysisRoot.resolve("libs/ui/src").mkdirs()
        analysisRoot.resolve("libs/ui/src/button.ts").writeText("export class Button {}")

        // Act
        val report = TypescriptAnalyzer(
            FileInfo(
                SupportedLanguage.TYPESCRIPT,
                "apps/web/src/main.ts",
                "import { Button } from '@org/ui/button'\nexport class Main { private button = new Button() }",
                analysisRoot = analysisRoot
            )
        ).analyze()

        // Assert
        val node = report.nodes.first { it.pathWithName.getName() == "Main" }
        assertThat(node.dependencies).contains(Dependency(path = Path(listOf("libs", "ui", "src", "button", "Button"))))
    }
}
