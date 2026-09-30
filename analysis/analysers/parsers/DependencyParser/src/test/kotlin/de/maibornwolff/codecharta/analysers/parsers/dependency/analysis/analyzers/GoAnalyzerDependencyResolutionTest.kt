package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.analyzeGo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.named
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.resolveAgainstEachOther
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class GoAnalyzerDependencyResolutionTest {
    private val configPackageCode = """
        package config

        type Config struct {
            Name string
        }

        func New() *Config {
            return &Config{}
        }
    """.trimIndent()

    @Test
    fun `should detect cross package type usage`() {
        // Arrange
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
        val nodes = analyzeGo(goCode, "./main.go")

        // Assert
        assertThat(nodes.named("processConfig")?.usedTypes?.map { it.name }).contains("Config")
        assertThat(nodes.flatMap { it.dependencies }).anyMatch { it.path.parts.contains("config") }
    }

    private fun crossPackageCases(): List<Arguments> = listOf(
        argumentSet(
            "package imported by its name",
            "./config/config.go",
            """
                package main

                import "config"

                func useConfig(c *config.Config) {
                    // Use config
                }

                func main() {
                    cfg := config.New()
                    useConfig(cfg)
                }
            """.trimIndent(),
            "./main.go"
        ),
        argumentSet(
            "package imported by its Go module path",
            "internal/config/config.go",
            """
                package main

                import "nocmt/internal/config"

                func main() {
                    cfg := config.New()
                    _ = cfg
                }
            """.trimIndent(),
            "cmd/nocmt/main.go"
        )
    )

    @ParameterizedTest
    @MethodSource("crossPackageCases")
    fun `should resolve a call into another package as an internal dependency`(configPath: String, mainCode: String, mainPath: String) {
        // Arrange
        val allNodes = analyzeGo(configPackageCode, configPath) + analyzeGo(mainCode, mainPath)

        // Act
        val resolvedNodes = allNodes.resolveAgainstEachOther()

        // Assert
        val mainNode = resolvedNodes.named("main")
        assertThat(mainNode).isNotNull()
        assertThat(mainNode!!.resolvedNodeDependencies.internalDependencies).anyMatch {
            it.path.parts.contains("config") && it.path.parts.contains("New")
        }
    }

    @Test
    fun `should resolve intra-package dependencies without imports`() {
        // Arrange
        val goCode = """
            package models

            type Address struct {
                Street string
                City   string
            }

            type User struct {
                Name    string
                Email   string
                Address Address
            }

            type Company struct {
                Name     string
                Location Address
                Owner    User
            }

            func NewUser(name string, addr Address) User {
                return User{
                    Name:    name,
                    Address: addr,
                }
            }

            func GetCompanyOwner(c Company) User {
                return c.Owner
            }

            func UpdateUserAddress(u *User, newAddr Address) {
                u.Address = newAddr
            }
        """.trimIndent()
        val nodes = analyzeGo(goCode, "./models/models.go")

        // Act
        val resolvedNodes = nodes.resolveAgainstEachOther()

        // Assert
        assertResolvedTypes(resolvedNodes.named("User"), "Address" to "models.Address")
        assertResolvedTypes(resolvedNodes.named("Company"), "Address" to "models.Address", "User" to "models.User")
        assertResolvedTypes(resolvedNodes.named("NewUser"), "User" to "models.User", "Address" to "models.Address")
        assertResolvedTypes(resolvedNodes.named("GetCompanyOwner"), "Company" to "models.Company", "User" to "models.User")
        assertThat(internalDependencyPaths(resolvedNodes.named("User"))).contains("models.Address")
        assertThat(internalDependencyPaths(resolvedNodes.named("Company"))).containsAll(listOf("models.Address", "models.User"))
    }

    private fun assertResolvedTypes(node: Node?, vararg expectedResolvedPathByType: Pair<String, String>) {
        assertThat(node).isNotNull()
        expectedResolvedPathByType.forEach { (typeName, resolvedPath) ->
            assertThat(node!!.usedTypes.find { it.name == typeName }?.resolvedPath?.withDots()).isEqualTo(resolvedPath)
        }
    }

    private fun internalDependencyPaths(node: Node?): List<String> =
        node!!.resolvedNodeDependencies.internalDependencies.map { it.path.withDots() }
}
