package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.analyzeGo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.named
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.GoAnalyzerTestSupport.names
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class GoAnalyzerDeclarationsTest {
    private val mainFunctionCode = """
        package main

        func main() {}
    """.trimIndent()

    @Test
    fun `should parse go code without throwing exceptions`() {
        // Act
        val nodes = analyzeGo(mainFunctionCode)

        // Assert
        assertThat(nodes).isNotNull()
    }

    @Test
    fun `should extract package name`() {
        // Act
        val nodes = analyzeGo(mainFunctionCode)

        // Assert
        assertThat(nodes.first().pathWithName.parts.take(2)).containsExactly("path", "main")
    }

    private fun singleDeclarationCases(): List<Arguments> = listOf(
        argumentSet("function declaration", mainFunctionCode, "main"),
        argumentSet(
            "struct declaration",
            """
                package main

                type User struct {
                    Name string
                    Age  int
                }
            """.trimIndent(),
            "User"
        ),
        argumentSet(
            "interface declaration",
            """
                package main

                type Writer interface {
                    Write([]byte) (int, error)
                }
            """.trimIndent(),
            "Writer"
        )
    )

    @ParameterizedTest
    @MethodSource("singleDeclarationCases")
    fun `should extract a single declaration as one node`(goCode: String, expectedName: String) {
        // Act
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.names()).containsExactly(expectedName)
    }

    private fun usedTypeCases(): List<Arguments> = listOf(
        argumentSet(
            "function parameter types",
            """
                package main

                func processUser(name string, age int) {}
            """.trimIndent(),
            listOf(Type.simple("string"), Type.simple("int"))
        ),
        argumentSet(
            "function return types",
            """
                package main

                func getUser() (string, int) {
                    return "", 0
                }
            """.trimIndent(),
            listOf(Type.simple("string"), Type.simple("int"))
        ),
        argumentSet(
            "struct field types",
            """
                package main

                type User struct {
                    Name    string
                    Age     int
                    Email   string
                }
            """.trimIndent(),
            listOf(Type.simple("string"), Type.simple("int"))
        ),
        argumentSet(
            "qualified type names",
            """
                package main

                import "context"

                func processContext(ctx context.Context) {}
            """.trimIndent(),
            listOf(Type.simple("Context"))
        )
    )

    @ParameterizedTest
    @MethodSource("usedTypeCases")
    fun `should extract used types`(goCode: String, expectedUsedTypes: List<Type>) {
        // Act
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.first().usedTypes).containsAll(expectedUsedTypes)
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
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.names()).containsExactlyInAnyOrder("User", "getUser")
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
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.named("User")?.nodeType?.name).isEqualTo("CLASS")
        assertThat(nodes.named("Writer")?.nodeType?.name).isEqualTo("INTERFACE")
        assertThat(nodes.named("getUser")?.nodeType?.name).isEqualTo("FUNCTION")
    }

    @Test
    fun `should aggregate method receivers into their type`() {
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
        val nodes = analyzeGo(goCode)

        // Assert
        assertThat(nodes.names()).containsExactly("User")
        assertThat(nodes.first().nodeType.name).isEqualTo("CLASS")
        assertThat(nodes.first().usedTypes).contains(Type.simple("string"))
    }
}
