package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.resolveTypes
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoAnalyzerDependencyResolutionTest {
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
