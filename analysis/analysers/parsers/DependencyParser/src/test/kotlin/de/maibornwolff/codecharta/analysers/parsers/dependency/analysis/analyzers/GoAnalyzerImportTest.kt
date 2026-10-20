package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoAnalyzerImportTest {
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
}
