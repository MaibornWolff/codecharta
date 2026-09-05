package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterGo

class GoDeclarationsQueryTest {
    private val golang = TreeSitterGo()
    private val query = GoDeclarationsQuery(golang)

    private fun parseGoCode(code: String) = TSParser()
        .apply {
            language = golang
        }.parseString(null, code)
        .rootNode

    @Test
    fun `should detect function declarations`() {
        // Arrange
        val goCode = """
            package main
            
            func main() {}
            func helper() {}
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val declarations = query.execute(rootNode)

        // Assert
        assertEquals(2, declarations.size)
        val declarationTypes = declarations.map { it.type }
        assertTrue(declarationTypes.all { it == "function_declaration" })
    }

    @Test
    fun `should detect type declarations`() {
        // Arrange
        val goCode = """
            package main
            
            type User struct {
                Name string
            }
            
            type Writer interface {
                Write([]byte) error
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val declarations = query.execute(rootNode)

        // Assert
        assertEquals(2, declarations.size)
        val declarationTypes = declarations.map { it.type }
        assertTrue(declarationTypes.all { it == "type_declaration" })
    }

    @Test
    fun `should detect method declarations`() {
        // Arrange - This test should FAIL initially
        val goCode = """
            package main
            
            type User struct {
                Name string
            }
            
            func (u *User) GetName() string {
                return u.Name
            }
            
            func (u *User) SetName(name string) {
                u.Name = name
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val declarations = query.execute(rootNode)

        // Assert
        // Should find: 1 type_declaration + 2 method_declarations = 3 total
        assertEquals(3, declarations.size, "Should detect type declaration AND method declarations")

        val declarationTypes = declarations.map { it.type }
        assertTrue(declarationTypes.contains("type_declaration"), "Should contain type_declaration")
        assertTrue(declarationTypes.contains("method_declaration"), "Should contain method_declaration")

        // Should have 2 method declarations
        val methodCount = declarationTypes.count { it == "method_declaration" }
        assertEquals(2, methodCount, "Should detect both method declarations")
    }

    @Test
    fun `should detect mixed declarations`() {
        // Arrange - This test should FAIL initially
        val goCode = """
            package main
            
            type Config struct {
                Name string
            }
            
            func NewConfig() *Config {
                return &Config{}
            }
            
            func (c *Config) Load() error {
                return nil
            }
            
            func (c *Config) Save() error {
                return nil
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val declarations = query.execute(rootNode)

        // Assert
        // Should find: 1 type + 1 function + 2 methods = 4 total
        assertEquals(4, declarations.size, "Should detect all declaration types")

        val declarationTypes = declarations.map { it.type }
        assertEquals(1, declarationTypes.count { it == "type_declaration" })
        assertEquals(1, declarationTypes.count { it == "function_declaration" })
        assertEquals(2, declarationTypes.count { it == "method_declaration" })
    }
}
