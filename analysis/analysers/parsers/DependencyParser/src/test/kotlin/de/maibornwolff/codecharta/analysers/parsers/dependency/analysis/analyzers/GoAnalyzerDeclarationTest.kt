package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class GoAnalyzerDeclarationTest {
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
}
