package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoAnalyzerUsedTypeTest {
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
    fun `should keep the line break a used type name starts with next to a missing token`() {
        // Arrange
        val goCode = "func T({\"\",//\n.go}"
        val fileInfo = FileInfo(SupportedLanguage.GO, "broken.go", goCode)

        // Act
        val report = GoAnalyzer(fileInfo).analyze()

        // Assert
        assertThat(report.nodes.single().usedTypes.map { it.name }).containsExactly("go", "\n.go")
    }
}
