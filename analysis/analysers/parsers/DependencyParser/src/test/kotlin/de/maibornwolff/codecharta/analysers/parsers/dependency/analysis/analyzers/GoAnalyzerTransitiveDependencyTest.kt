package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoAnalyzerTransitiveDependencyTest {
    @Test
    fun `should resolve transitive dependencies through private functions`() {
        // Given - Code with public -> private -> public dependency chain
        val goCode = """
            package main
            
            import "fmt"
            
            func PublicParser() {
                data := privateHelper()
                processData(data)
            }
            
            func privateHelper() string {
                err := NewQueryError()
                formatted := FormatError(err)
                return formatted
            }
            
            func processData(s string) {
                // private function implementation
            }
            
            func NewQueryError() error {
                return fmt.Errorf("query error")
            }
            
            func FormatError(err error) string {
                return err.Error()
            }
        """.trimIndent()

        // When
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./main.go", goCode)).analyzeWithTransitiveDependencies(true)

        // Then
        // Find the PublicParser node
        val publicParserNode = report.nodes.find { it.pathWithName.parts.last() == "PublicParser" }
        assertThat(publicParserNode).isNotNull()

        // PublicParser should have transitive dependencies on NewQueryError and FormatError
        val usedTypeNames = publicParserNode!!.usedTypes.map { it.name }
        assertThat(usedTypeNames).contains("NewQueryError", "FormatError")

        // Private functions should not appear as nodes after transitive resolution
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(nodeNames).doesNotContain("privateHelper", "processData")

        // Only public functions should be nodes
        assertThat(nodeNames).containsExactlyInAnyOrder("PublicParser", "NewQueryError", "FormatError")
    }

    @Test
    fun `should handle multiple levels of private function calls`() {
        // Given - Deep chain of private functions
        val goCode = """
            package main
            
            func PublicEntryPoint() {
                result := level1Private()
                Process(result)
            }
            
            func level1Private() string {
                data := level2Private()
                return transform(data)
            }
            
            func level2Private() string {
                value := level3Private()
                return process(value)
            }
            
            func level3Private() string {
                return GetPublicData()
            }
            
            func transform(s string) string {
                return s
            }
            
            func process(s string) string {
                return s
            }
            
            func GetPublicData() string {
                return "data"
            }
            
            func Process(s string) {
                // Public processor
            }
        """.trimIndent()

        // When
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./main.go", goCode)).analyzeWithTransitiveDependencies(true)

        // Then
        val publicEntryNode = report.nodes.find { it.pathWithName.parts.last() == "PublicEntryPoint" }
        assertThat(publicEntryNode).isNotNull()

        // Should have transitive dependencies on public functions only
        val usedTypeNames = publicEntryNode!!.usedTypes.map { it.name }
        assertThat(usedTypeNames).contains("GetPublicData", "Process")

        // No private functions should be in the dependency list
        assertThat(usedTypeNames).doesNotContain("level1Private", "level2Private", "level3Private", "transform", "process")

        // Only public functions should be nodes
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(nodeNames).containsExactlyInAnyOrder("PublicEntryPoint", "GetPublicData", "Process")
    }

    @Test
    fun `should handle circular dependencies through private functions`() {
        // Given - Circular dependency through private functions
        val goCode = """
            package main
            
            func PublicA() {
                privateA()
            }
            
            func privateA() {
                PublicB()
            }
            
            func PublicB() {
                privateB()
            }
            
            func privateB() {
                PublicA() // Creates cycle
                PublicC()
            }
            
            func PublicC() {
                // No dependencies
            }
        """.trimIndent()

        // When
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./main.go", goCode)).analyzeWithTransitiveDependencies(true)

        // Then
        val publicANode = report.nodes.find { it.pathWithName.parts.last() == "PublicA" }
        val publicBNode = report.nodes.find { it.pathWithName.parts.last() == "PublicB" }
        val publicCNode = report.nodes.find { it.pathWithName.parts.last() == "PublicC" }

        assertThat(publicANode).isNotNull()
        assertThat(publicBNode).isNotNull()
        assertThat(publicCNode).isNotNull()

        // PublicA should depend on PublicB (through privateA)
        assertThat(publicANode!!.usedTypes.map { it.name }).contains("PublicB")

        // PublicB should depend on PublicA and PublicC (through privateB)
        assertThat(publicBNode!!.usedTypes.map { it.name }).contains("PublicA", "PublicC")

        // PublicC should have no dependencies
        assertThat(publicCNode!!.usedTypes).isEmpty()

        // Only public functions should be nodes
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(nodeNames).containsExactlyInAnyOrder("PublicA", "PublicB", "PublicC")
    }

    @Test
    fun `should not include private-to-private dependencies in public nodes`() {
        // Given - Private functions calling other private functions
        val goCode = """
            package main
            
            func PublicFunction() {
                privateEntryPoint()
            }
            
            func privateEntryPoint() {
                // This calls other private functions and one public
                helper1()
                helper2()
                PublicUtility()
            }
            
            func helper1() {
                helper3()
            }
            
            func helper2() {
                helper3()
            }
            
            func helper3() {
                // Dead end - no public calls
            }
            
            func PublicUtility() {
                // Public function
            }
        """.trimIndent()

        // When
        val report = GoAnalyzer(FileInfo(SupportedLanguage.GO, "./main.go", goCode)).analyzeWithTransitiveDependencies(true)

        // Then
        val publicFunctionNode = report.nodes.find { it.pathWithName.parts.last() == "PublicFunction" }
        assertThat(publicFunctionNode).isNotNull()

        // Should only have dependency on PublicUtility (not on helper functions)
        val usedTypeNames = publicFunctionNode!!.usedTypes.map { it.name }
        assertThat(usedTypeNames).containsExactly("PublicUtility")
        assertThat(usedTypeNames).doesNotContain("helper1", "helper2", "helper3", "privateEntryPoint")

        // Only public functions should be nodes
        val nodeNames = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(nodeNames).containsExactlyInAnyOrder("PublicFunction", "PublicUtility")
    }
}
