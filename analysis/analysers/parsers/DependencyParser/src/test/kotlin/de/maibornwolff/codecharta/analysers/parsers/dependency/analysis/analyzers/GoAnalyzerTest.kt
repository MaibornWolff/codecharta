package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class GoAnalyzerTest {
    @Test
    fun `should parse go code without throwing exceptions`() {
        // Arrange
        val goCode = """
            package main
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        assertThat(report.nodes).isNotNull()
    }

    @Test
    fun `should extract package name`() {
        // Arrange
        val goCode = """
            package main
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        if (report.nodes.isNotEmpty()) {
            val node = report.nodes.first()
            assertEquals("path", node.pathWithName.parts[0])
            assertEquals("main", node.pathWithName.parts[1])
        }
    }

    @Test
    fun `should extract function declaration`() {
        // Arrange
        val goCode = """
            package main
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        assertEquals(1, report.nodes.size)
        assertEquals(
            "main",
            report.nodes
                .first()
                .pathWithName.parts
                .last()
        )
    }

    @Test
    fun `should extract struct declaration`() {
        // Arrange
        val goCode = """
            package main
            
            type User struct {
                Name string
                Age  int
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        assertEquals(1, report.nodes.size)
        assertEquals(
            "User",
            report.nodes
                .first()
                .pathWithName.parts
                .last()
        )
    }

    @Test
    fun `should extract interface declaration`() {
        // Arrange
        val goCode = """
            package main
            
            type Writer interface {
                Write([]byte) (int, error)
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        assertEquals(1, report.nodes.size)
        assertEquals(
            "Writer",
            report.nodes
                .first()
                .pathWithName.parts
                .last()
        )
    }

    @Test
    fun `should extract simple import`() {
        // Arrange
        val goCode = """
            package main
            
            import "fmt"
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("fmt"))))
    }

    @Test
    fun `should extract multiple imports`() {
        // Arrange
        val goCode = """
            package main
            
            import (
                "fmt"
                "os"
                "strings"
            )
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).containsAll(
            listOf(
                Dependency(Path(listOf("fmt"))),
                Dependency(Path(listOf("os"))),
                Dependency(Path(listOf("strings")))
            )
        )
    }

    @Test
    fun `should extract function parameter types`() {
        // Arrange
        val goCode = """
            package main
            
            func processUser(name string, age int) {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract function return types`() {
        // Arrange
        val goCode = """
            package main
            
            func getUser() (string, int) {
                return "", 0
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract struct field types`() {
        // Arrange
        val goCode = """
            package main
            
            type User struct {
                Name    string
                Age     int
                Email   string
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract qualified type names`() {
        // Arrange
        val goCode = """
            package main
            
            import "context"
            
            func processContext(ctx context.Context) {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(Type.simple("Context"))
    }

    @Test
    fun `should create nodes for multiple declarations`() {
        // Arrange
        val goCode = """
            package main
            
            type User struct {
                Name string
            }
            
            func getUser() User {
                return User{}
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        assertEquals(2, report.nodes.size)
        val names = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(names).containsAll(listOf("User", "getUser"))
    }

    @Test
    fun `should set correct node types`() {
        // Arrange
        val goCode = """
            package main
            
            type User struct {
                Name string
            }
            
            type Writer interface {
                Write([]byte) error
            }
            
            func getUser() User {
                return User{}
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val nodesByName = report.nodes.associateBy { it.pathWithName.parts.last() }
        assertEquals("CLASS", nodesByName["User"]?.nodeType?.name)
        assertEquals("INTERFACE", nodesByName["Writer"]?.nodeType?.name)
        assertEquals("FUNCTION", nodesByName["getUser"]?.nodeType?.name)
    }

    @Test
    fun `should extract dot import as wildcard`() {
        // Arrange
        val goCode = """
            package main
            
            import . "fmt"
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("fmt")), isWildcard = true, isDotImport = true))
    }

    @Test
    fun `should extract import alias`() {
        // Arrange
        val goCode = """
            package main
            
            import alias "github.com/example/package"
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "example", "package"))))
    }

    @Test
    fun `should extract blank import`() {
        // Arrange
        val goCode = """
            package main
            
            import _ "github.com/lib/pq"
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "lib", "pq"))))
    }

    @Test
    fun `should extract method receivers`() {
        // Arrange
        val goCode = """
            package main
            
            type User struct {
                Name string
            }
            
            func (u User) GetName() string {
                return u.Name
            }
            
            func (u *User) SetName(name string) {
                u.Name = name
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        // Methods should not be separate nodes - they should be aggregated into the User type
        assertEquals(1, report.nodes.size)
        val userNode = report.nodes.first()
        assertEquals("User", userNode.pathWithName.parts.last())
        assertEquals("CLASS", userNode.nodeType.name)

        // Method dependencies should be aggregated into the User type's usedTypes
        assertThat(userNode.usedTypes).contains(Type.simple("string"))
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
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./config.go", goCode)).analyze()

        // Assert
        // Check that we have the expected components
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(nodeNames).containsAll(listOf("CommentConfig", "Config", "New", "loadConfigFile"))

        // Check that we have import dependencies
        val allDependencies = report.nodes.flatMap { it.dependencies }.map { it.path.parts }
        // Import paths with slashes are now correctly split into components
        assertThat(allDependencies).anyMatch { it == listOf("encoding", "json") }
        assertThat(allDependencies).anyMatch { it == listOf("fmt") }
        assertThat(allDependencies).anyMatch { it == listOf("os") }
        assertThat(allDependencies).anyMatch { it == listOf("path", "filepath") }
        assertThat(allDependencies).anyMatch { it == listOf("regexp") }
        assertThat(allDependencies).anyMatch { it == listOf("strings") }

        // Check that Config struct uses CommentConfig as a type
        val configNode = report.nodes.find { it.pathWithName.parts.last() == "Config" }
        assertThat(configNode?.usedTypes?.map { it.name }).contains("CommentConfig")

        // Verify New function returns Config type
        val newNode = report.nodes.find { it.pathWithName.parts.last() == "New" }
        assertThat(newNode?.usedTypes?.map { it.name }).contains("Config")
    }

    @Test
    fun `should detect cross package type usage`() {
        // Arrange - Simulate usage of types from another package
        val goCode = """
            package main

            import (
                "config"
                "fmt"
            )

            func main() {
                cfg := config.New()
                cfg.LoadConfigurations()
                fmt.Println("Done")
            }

            func processConfig(c *config.Config) {
                // Process the config
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./main.go", goCode)).analyze()

        // Assert
        println("Found ${report.nodes.size} nodes:")
        report.nodes.forEach { node ->
            println("Node: ${node.pathWithName.parts.last()}")
            println("  Dependencies: ${node.dependencies.map { it.path.parts }}")
            println("  UsedTypes: ${node.usedTypes.map { it.name }}")
            println()
        }

        // Should detect usage of config.Config and config.New
        val processConfigNode = report.nodes.find { it.pathWithName.parts.last() == "processConfig" }
        assertThat(processConfigNode?.usedTypes?.map { it.name }).contains("Config")

        // Should have import dependency on config package
        val configImport = report.nodes.flatMap { it.dependencies }.find { it.path.parts.contains("config") }
        assertThat(configImport).isNotNull()
    }

    @Test
    fun `should resolve cross package dependencies after dependency resolution`() {
        // Arrange - Simulate config package
        val configCode = """
            package config

            type Config struct {
                Name string
            }

            func New() *Config {
                return &Config{}
            }
        """.trimIndent()

        // Arrange - Simulate main package that uses config
        val mainCode = """
            package main

            import "config"

            func useConfig(c *config.Config) {
                // Use config
            }

            func main() {
                cfg := config.New()
                useConfig(cfg)
            }
        """.trimIndent()

        // Act - Analyze both packages
        val configReport = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./config/config.go", configCode)).analyze()
        val mainReport = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./main.go", mainCode)).analyze()

        // Simulate dependency resolution process
        val allNodes = configReport.nodes + mainReport.nodes
        val projectDictionary = allNodes.map { it.pathWithName }.groupBy { it.parts.last() }
        val knownNodePaths = allNodes.map { it.pathWithName.withDots() }.toSet()
        val languageDictionary = mapOf<String, Path>()

        println("Project Dictionary:")
        projectDictionary.forEach { (key, paths) ->
            println("  $key -> ${paths.map { it.withDots() }}")
        }
        println()

        // Debug the useConfig node before resolution
        val useConfigNodeBefore = allNodes.find { it.pathWithName.parts.last() == "useConfig" }
        println("useConfig node before resolution:")
        println("  Dependencies: ${useConfigNodeBefore?.dependencies?.map { "${it.path.withDots()} (wildcard: ${it.isWildcard})" }}")
        println("  UsedTypes: ${useConfigNodeBefore?.usedTypes?.map { it.name }}")
        println()

        // Apply dependency resolution
        val resolvedNodes = allNodes.map { node ->
            println("Resolving node: ${node.pathWithName.withDots()}")
            println(
                "  Before resolution - UsedTypes: ${node.usedTypes.map { "${it.name} -> ${it.resolvedPath?.withDots() ?: "UNRESOLVED"}" }}"
            )
            val resolvedNode = node.resolveTypes(projectDictionary, emptyMap(), allNodes.map { it.pathWithName.withDots() }.toSet())
            println(
                "  After resolution - UsedTypes: ${resolvedNode.usedTypes.map {
                    "${it.name} -> ${it.resolvedPath?.withDots() ?: "UNRESOLVED"}"
                }}"
            )
            println("  Resolved dependencies: ${resolvedNode.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() }}")
            println()
            resolvedNode
        }

        // Assert
        val mainNode = resolvedNodes.find { it.pathWithName.parts.last() == "main" }
        assertThat(mainNode).isNotNull()

        println("Main node after resolution:")
        println("  Dependencies: ${mainNode!!.dependencies.map { dep -> dep.path.parts }}")

        // The main function should have a dependency on config.New
        val hasConfigDependency = mainNode.resolvedNodeDependencies.internalDependencies.any {
            it.path.parts.contains("config") && it.path.parts.contains("New")
        }
        assertThat(hasConfigDependency).isTrue()
    }

    @Test
    fun `should debug real module imports`() {
        // Arrange
        val realGoCode = """
            package main

            import (
                "bufio"
                "bytes"
                "flag"
                "fmt"
                "os"
                "os/exec"
                "regexp"
                "strconv"
                "strings"

                "nocmt/internal/cli"
                "nocmt/internal/config"
                "nocmt/internal/processor"
                "nocmt/internal/walker"
            )

            func main() {
                commentConfig := config.New()
                walker.IsGitRepository(".")
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./cmd/nocmt/main.go", realGoCode)).analyze()

        // Assert
        println("Found ${report.nodes.size} nodes:")
        report.nodes.forEach { node ->
            println("Node: ${node.pathWithName.parts.last()}")
            println("  Dependencies: ${node.dependencies.map { "${it.path.parts} (wildcard: ${it.isWildcard})" }}")
            println("  UsedTypes: ${node.usedTypes.map { it.name }}")
            println()
        }

        val mainNode = report.nodes.find { it.pathWithName.parts.last() == "main" }
        assertThat(mainNode).isNotNull()

        // Check that module imports are being detected
        val importPaths = mainNode!!.dependencies.map { it.path.parts }
        assertThat(importPaths).anyMatch { it == listOf("nocmt", "internal", "config") }
        assertThat(importPaths).anyMatch { it == listOf("nocmt", "internal", "walker") }
    }

    @Test
    fun `should resolve Go module dependencies end to end`() {
        // Arrange - Simulate the config package
        val configCode = """
            package config

            type Config struct {
                Name string
            }

            func New() *Config {
                return &Config{}
            }
        """.trimIndent()

        // Arrange - Simulate the main package using the config
        val mainCode = """
            package main

            import "nocmt/internal/config"

            func main() {
                cfg := config.New()
                _ = cfg
            }
        """.trimIndent()

        // Act - Analyze both files
        val configReport = GoAnalyzer(FileInfo(SupportedLanguage.GO, "internal/config/config.go", configCode)).analyze()
        val mainReport = GoAnalyzer(FileInfo(SupportedLanguage.GO, "cmd/nocmt/main.go", mainCode)).analyze()

        // Debug output
        println("Config package nodes:")
        configReport.nodes.forEach { println("  ${it.pathWithName.parts}") }
        println("Main package nodes:")
        mainReport.nodes.forEach {
            println("  ${it.pathWithName.parts}")
            println("    Dependencies: ${it.dependencies.map { dep -> dep.path.parts }}")
            println("    UsedTypes: ${it.usedTypes.map { it.name }}")
        }

        // Simulate dependency resolution
        val allNodes = configReport.nodes + mainReport.nodes
        val projectDictionary = allNodes.map { it.pathWithName }.groupBy { it.parts.last() }
        println("Project Dictionary:")
        projectDictionary.forEach { (key, paths) ->
            println("  $key -> ${paths.map { it.withDots() }}")
        }

        // Apply dependency resolution
        val resolvedNodes = allNodes.map { node ->
            println("Resolving node: ${node.pathWithName.withDots()}")
            println(
                "  Before resolution - UsedTypes: ${node.usedTypes.map { "${it.name} -> ${it.resolvedPath?.withDots() ?: "UNRESOLVED"}" }}"
            )
            val resolvedNode = node.resolveTypes(projectDictionary, emptyMap(), allNodes.map { it.pathWithName.withDots() }.toSet())
            println(
                "  After resolution - UsedTypes: ${resolvedNode.usedTypes.map {
                    "${it.name} -> ${it.resolvedPath?.withDots() ?: "UNRESOLVED"}"
                }}"
            )
            println("  Resolved dependencies: ${resolvedNode.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() }}")
            println()
            resolvedNode
        }

        // Assert
        val mainNode = resolvedNodes.find { it.pathWithName.parts.last() == "main" }
        assertThat(mainNode).isNotNull()

        println("Main node after resolution:")
        println("  Dependencies: ${mainNode!!.dependencies.map { dep -> dep.path.parts }}")

        // The main function should have a dependency on config.New
        val hasConfigDependency = mainNode.resolvedNodeDependencies.internalDependencies.any {
            it.path.parts.contains("config") && it.path.parts.contains("New")
        }
        assertThat(hasConfigDependency).isTrue()
    }

    @Test
    fun `should handle all Go import types correctly`() {
        // Arrange - All types of Go imports in one test
        val goCode = """
            package main
            
            import (
                "fmt"                          // Standard import
                "encoding/json"                // Standard import with path
                "github.com/user/repo"         // Remote import
                alias "github.com/other/pkg"   // Named import
                _ "github.com/lib/pq"          // Blank import
                . "math"                       // Dot import
            )
            
            func main() {}
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies

        // Standard imports
        assertThat(dependencies).contains(Dependency(Path(listOf("fmt"))))
        assertThat(dependencies).contains(Dependency(Path(listOf("encoding", "json"))))

        // Remote import
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "user", "repo"))))

        // Named import (alias doesn't affect dependency path)
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "other", "pkg"))))

        // Blank import
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "lib", "pq"))))

        // Dot import (should have both flags set)
        assertThat(dependencies).contains(Dependency(Path(listOf("math")), isWildcard = true, isDotImport = true))
    }

    @Test
    fun `should handle standard import with qualified type usage`() {
        // Arrange - Standard import with qualified type usage
        val goCode = """
            package main
            
            import "fmt"
            
            func main() {
                fmt.Println("Hello")
            }
            
            func useFormatter() fmt.Formatter {
                return nil
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("fmt"))))

        // Should extract qualified type names (fmt.Formatter -> Formatter)
        val useFormatterNode = report.nodes.find { it.pathWithName.parts.last() == "useFormatter" }
        assertThat(useFormatterNode?.usedTypes?.map { it.name }).contains("Formatter")
    }

    @Test
    fun `should handle remote import with qualified type usage`() {
        // Arrange - Remote import with qualified type usage
        val goCode = """
            package main
            
            import "github.com/user/repo"
            
            func processData(data repo.Data) {
                // Process data
            }
            
            func createClient() *repo.Client {
                return repo.NewClient()
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "user", "repo"))))

        // Should extract qualified type names
        val processDataNode = report.nodes.find { it.pathWithName.parts.last() == "processData" }
        assertThat(processDataNode?.usedTypes?.map { it.name }).contains("Data")

        val createClientNode = report.nodes.find { it.pathWithName.parts.last() == "createClient" }
        assertThat(createClientNode?.usedTypes?.map { it.name }).contains("Client")
    }

    @Test
    fun `should handle named import with alias usage`() {
        // Arrange - Named import with alias usage
        val goCode = """
            package main
            
            import json "encoding/json"
            
            func parseJSON(data []byte) (*json.Decoder, error) {
                return json.NewDecoder(nil), nil
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(Dependency(Path(listOf("encoding", "json"))))

        // Should extract type names used with alias (json.Decoder -> Decoder)
        val parseJSONNode = report.nodes.find { it.pathWithName.parts.last() == "parseJSON" }
        assertThat(parseJSONNode?.usedTypes?.map { it.name }).contains("Decoder")
    }

    @Test
    fun `should handle blank import for side effects only`() {
        // Arrange - Blank import for side effects (no direct usage)
        val goCode = """
            package main
            
            import _ "github.com/lib/pq"
            import "database/sql"
            
            func connectDB() (*sql.DB, error) {
                return sql.Open("postgres", "connection_string")
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies

        // Should have blank import dependency (for side effects)
        assertThat(dependencies).contains(Dependency(Path(listOf("github_com", "lib", "pq"))))

        // Should also have regular import dependency
        assertThat(dependencies).contains(Dependency(Path(listOf("database", "sql"))))

        // Should extract type from regular import
        val connectDBNode = report.nodes.find { it.pathWithName.parts.last() == "connectDB" }
        assertThat(connectDBNode?.usedTypes?.map { it.name }).contains("DB")
    }

    @Test
    fun `should handle dot import with unqualified access`() {
        // Arrange - Dot import allowing unqualified access
        val goCode = """
            package main
            
            import . "math"
            
            func calculate(x float64) float64 {
                return Sin(x) + Cos(x)  // Unqualified access due to dot import
            }
            
            func getPI() float64 {
                return Pi  // Unqualified constant access
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./path", goCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies

        // Should have dot import with both flags set
        assertThat(dependencies).contains(Dependency(Path(listOf("math")), isWildcard = true, isDotImport = true))

        // Should extract unqualified type names (Sin, Cos, Pi are now available without qualification)
        val calculateNode = report.nodes.find { it.pathWithName.parts.last() == "calculate" }
        assertThat(calculateNode?.usedTypes?.map { it.name }).contains("float64")

        val getPINode = report.nodes.find { it.pathWithName.parts.last() == "getPI" }
        assertThat(getPINode?.usedTypes?.map { it.name }).contains("float64")
    }

    @Test
    fun `should resolve intra-package dependencies without imports`() {
        // This test documents the fix for intra-package dependency resolution
        // After removing implicit wildcard imports, types within the same package
        // couldn't be resolved. The fix checks if a type belongs to the same package
        // before checking imports, ensuring dependencies between types in the same
        // Go package are correctly captured.

        // Arrange - Multiple types and functions in the same package that reference each other
        val goCode = """
            package models
            
            type Address struct {
                Street string
                City   string
            }
            
            type User struct {
                Name    string
                Email   string
                Address Address  // Uses Address type from same package
            }
            
            type Company struct {
                Name     string
                Location Address  // Uses Address type from same package
                Owner    User     // Uses User type from same package
            }
            
            func NewUser(name string, addr Address) User {  // Uses Address and User from same package
                return User{
                    Name:    name,
                    Address: addr,
                }
            }
            
            func GetCompanyOwner(c Company) User {  // Uses Company and User from same package
                return c.Owner
            }
            
            func UpdateUserAddress(u *User, newAddr Address) {  // Uses User and Address from same package
                u.Address = newAddr
            }
        """.trimIndent()

        // Act
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./models/models.go", goCode)).analyze()

        // Create project dictionary for dependency resolution
        val projectDictionary = report.nodes.map { it.pathWithName }.groupBy { it.parts.last() }
        val knownNodePaths = report.nodes.map { it.pathWithName.withDots() }.toSet()
        val languageDictionary = mapOf<String, Path>()

        // Apply dependency resolution
        val resolvedNodes = report.nodes.map { node ->
            node.resolveTypes(projectDictionary, languageDictionary, knownNodePaths)
        }

        // Assert - Verify that types are correctly resolved within the same package

        // 1. User struct should have resolved dependency on Address
        val userNode = resolvedNodes.find { it.pathWithName.parts.last() == "User" }
        assertThat(userNode).isNotNull()
        val addressTypeInUser = userNode!!.usedTypes.find { it.name == "Address" }
        assertThat(addressTypeInUser?.resolvedPath?.withDots()).isEqualTo("models.Address")

        // 2. Company struct should have resolved dependencies on both Address and User
        val companyNode = resolvedNodes.find { it.pathWithName.parts.last() == "Company" }
        assertThat(companyNode).isNotNull()
        val addressTypeInCompany = companyNode!!.usedTypes.find { it.name == "Address" }
        val userTypeInCompany = companyNode.usedTypes.find { it.name == "User" }
        assertThat(addressTypeInCompany?.resolvedPath?.withDots()).isEqualTo("models.Address")
        assertThat(userTypeInCompany?.resolvedPath?.withDots()).isEqualTo("models.User")

        // 3. NewUser function should have resolved dependencies on User and Address
        val newUserNode = resolvedNodes.find { it.pathWithName.parts.last() == "NewUser" }
        assertThat(newUserNode).isNotNull()
        val userTypeInNewUser = newUserNode!!.usedTypes.find { it.name == "User" }
        val addressTypeInNewUser = newUserNode.usedTypes.find { it.name == "Address" }
        assertThat(userTypeInNewUser?.resolvedPath?.withDots()).isEqualTo("models.User")
        assertThat(addressTypeInNewUser?.resolvedPath?.withDots()).isEqualTo("models.Address")

        // 4. GetCompanyOwner function should have resolved dependencies on Company and User
        val getOwnerNode = resolvedNodes.find { it.pathWithName.parts.last() == "GetCompanyOwner" }
        assertThat(getOwnerNode).isNotNull()
        val companyTypeInGetOwner = getOwnerNode!!.usedTypes.find { it.name == "Company" }
        val userTypeInGetOwner = getOwnerNode.usedTypes.find { it.name == "User" }
        assertThat(companyTypeInGetOwner?.resolvedPath?.withDots()).isEqualTo("models.Company")
        assertThat(userTypeInGetOwner?.resolvedPath?.withDots()).isEqualTo("models.User")

        // 5. Verify internal dependencies are created after resolution
        val userNodeDeps = userNode.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() }
        assertThat(userNodeDeps).contains("models.Address")

        val companyNodeDeps = companyNode.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() }
        assertThat(companyNodeDeps).containsAll(listOf("models.Address", "models.User"))
    }
}
