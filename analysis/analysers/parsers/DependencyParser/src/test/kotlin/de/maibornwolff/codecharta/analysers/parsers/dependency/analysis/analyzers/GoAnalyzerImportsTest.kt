package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.analyzeGo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.named
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.names
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class GoAnalyzerImportsTest {
    private fun dependencyOn(vararg parts: String) = Dependency(Path(parts.toList()))

    private fun dotImportOf(vararg parts: String) = Dependency(Path(parts.toList()), isWildcard = true, isDotImport = true)

    private fun importDependencyCases(): List<Arguments> = listOf(
        argumentSet("simple import", mainWithImports("import \"fmt\""), listOf(dependencyOn("fmt"))),
        argumentSet(
            "multiple imports",
            mainWithImports("import (\n    \"fmt\"\n    \"os\"\n    \"strings\"\n)"),
            listOf(dependencyOn("fmt"), dependencyOn("os"), dependencyOn("strings"))
        ),
        argumentSet("dot import as wildcard", mainWithImports("import . \"fmt\""), listOf(dotImportOf("fmt"))),
        argumentSet(
            "import alias",
            mainWithImports("import alias \"github.com/example/package\""),
            listOf(dependencyOn("github_com", "example", "package"))
        ),
        argumentSet("blank import", mainWithImports("import _ \"github.com/lib/pq\""), listOf(dependencyOn("github_com", "lib", "pq"))),
        argumentSet(
            "all import kinds in one block",
            mainWithImports(
                """
                import (
                    "fmt"                          // Standard import
                    "encoding/json"                // Standard import with path
                    "github.com/user/repo"         // Remote import
                    alias "github.com/other/pkg"   // Named import
                    _ "github.com/lib/pq"          // Blank import
                    . "math"                       // Dot import
                )
                """.trimIndent()
            ),
            listOf(
                dependencyOn("fmt"),
                dependencyOn("encoding", "json"),
                dependencyOn("github_com", "user", "repo"),
                dependencyOn("github_com", "other", "pkg"),
                dependencyOn("github_com", "lib", "pq"),
                dotImportOf("math")
            )
        ),
        argumentSet(
            "module imports in a separate group of the import block",
            mainWithImports(
                """
                import (
                    "fmt"
                    "os/exec"

                    "nocmt/internal/config"
                    "nocmt/internal/walker"
                )
                """.trimIndent()
            ),
            listOf(
                dependencyOn("fmt"),
                dependencyOn("os", "exec"),
                dependencyOn("nocmt", "internal", "config"),
                dependencyOn("nocmt", "internal", "walker")
            )
        )
    )

    private fun mainWithImports(imports: String) = "package main\n\n$imports\n\nfunc main() {}"

    @ParameterizedTest
    @MethodSource("importDependencyCases")
    fun `should extract import dependencies`(goCode: String, expectedDependencies: List<Dependency>) {
        // Act
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.first().dependencies).containsAll(expectedDependencies)
    }

    private fun qualifiedUsageCases(): List<Arguments> = listOf(
        argumentSet(
            "standard import with qualified type usage",
            """
                package main

                import "fmt"

                func main() {
                    fmt.Println("Hello")
                }

                func useFormatter() fmt.Formatter {
                    return nil
                }
            """.trimIndent(),
            listOf(dependencyOn("fmt")),
            mapOf("useFormatter" to "Formatter")
        ),
        argumentSet(
            "remote import with qualified type usage",
            """
                package main

                import "github.com/user/repo"

                func processData(data repo.Data) {
                    // Process data
                }

                func createClient() *repo.Client {
                    return repo.NewClient()
                }
            """.trimIndent(),
            listOf(dependencyOn("github_com", "user", "repo")),
            mapOf("processData" to "Data", "createClient" to "Client")
        ),
        argumentSet(
            "named import with alias usage",
            """
                package main

                import json "encoding/json"

                func parseJSON(data []byte) (*json.Decoder, error) {
                    return json.NewDecoder(nil), nil
                }
            """.trimIndent(),
            listOf(dependencyOn("encoding", "json")),
            mapOf("parseJSON" to "Decoder")
        ),
        argumentSet(
            "blank import for side effects next to a regular import",
            """
                package main

                import _ "github.com/lib/pq"
                import "database/sql"

                func connectDB() (*sql.DB, error) {
                    return sql.Open("postgres", "connection_string")
                }
            """.trimIndent(),
            listOf(dependencyOn("github_com", "lib", "pq"), dependencyOn("database", "sql")),
            mapOf("connectDB" to "DB")
        ),
        argumentSet(
            "dot import with unqualified access",
            """
                package main

                import . "math"

                func calculate(x float64) float64 {
                    return Sin(x) + Cos(x)  // Unqualified access due to dot import
                }

                func getPI() float64 {
                    return Pi  // Unqualified constant access
                }
            """.trimIndent(),
            listOf(dotImportOf("math")),
            mapOf("calculate" to "float64", "getPI" to "float64")
        )
    )

    @ParameterizedTest
    @MethodSource("qualifiedUsageCases")
    fun `should extract the import dependency and the used type names of each declaration`(
        goCode: String,
        expectedDependencies: List<Dependency>,
        expectedUsedTypeByNode: Map<String, String>
    ) {
        // Act
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.first().dependencies).containsAll(expectedDependencies)
        expectedUsedTypeByNode.forEach { (nodeName, usedType) ->
            assertThat(nodes.named(nodeName)?.usedTypes?.map { it.name }).contains(usedType)
        }
    }

    @Test
    fun `should analyze config file dependencies`() {
        // Arrange
        val goCode = """
            package config

            import (
                "encoding/json"
                "fmt"
                "os"
                "path/filepath"
                "regexp"
                "strings"
            )

            type CommentConfig struct {
                Patterns []string `json:"patterns"`
            }

            type Config struct {
                CommentConfig CommentConfig `json:"comment_config"`
                IgnoreFiles   []string     `json:"ignore_files"`
            }

            func New() *Config {
                return &Config{}
            }

            func loadConfigFile() (*Config, error) {
                return &Config{}, nil
            }

            func (c *Config) LoadConfigurations() error {
                home, err := os.UserHomeDir()
                if err != nil {
                    return err
                }
                return nil
            }
        """.trimIndent()

        // Act
        val nodes = analyzeGo(goCode, "./config.go")

        // Assert
        assertThat(nodes.names()).containsAll(listOf("CommentConfig", "Config", "New", "loadConfigFile"))
        assertThat(nodes.flatMap { it.dependencies }.map { it.path.parts }).contains(
            listOf("encoding", "json"),
            listOf("fmt"),
            listOf("os"),
            listOf("path", "filepath"),
            listOf("regexp"),
            listOf("strings")
        )
        assertThat(nodes.named("Config")?.usedTypes?.map { it.name }).contains("CommentConfig")
        assertThat(nodes.named("New")?.usedTypes?.map { it.name }).contains("Config")
    }
}
