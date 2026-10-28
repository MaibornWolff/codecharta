package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.angular.AngularTemplateAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.AngularSelector
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AngularTemplateAnalyzerTest {
    private fun analyze(content: String, physicalPath: String = "src/app/cave/cave.component.html") =
        AngularTemplateAnalyzer(FileInfo(SupportedLanguage.ANGULAR, physicalPath, content)).analyze()

    @Test
    fun `should report the template as one script node named after its file`() {
        // Arrange
        val content = "<p>Welcome to the cellar</p>"

        // Act
        val report = analyze(content)

        // Assert
        val node = report.nodes.single()
        assertThat(node.pathWithName.parts).containsExactly("src", "app", "cave", "cave_component_html")
        assertThat(node.physicalPath).isEqualTo("src/app/cave/cave.component.html")
        assertThat(node.nodeType).isEqualTo(NodeType.SCRIPT)
        assertThat(node.language).isEqualTo(SupportedLanguage.ANGULAR)
        assertThat(node.dependencies).isEmpty()
    }

    @Test
    fun `should use the pipe names the template names`() {
        // Arrange
        val content = """
            <app-torch [lit]="isLit" />
            <p>{{ treasure | goldCoins }}</p>
        """.trimIndent()

        // Act
        val report = analyze(content)

        // Assert
        assertThat(report.nodes.single().usedTypes.map { it.name }).containsExactly("goldCoins")
    }

    @Test
    fun `should carry the elements of the template for matching selectors`() {
        // Arrange
        val content = "<p appGlow>lit</p>"

        // Act
        val report = analyze(content)

        // Assert
        assertThat(
            report.nodes
                .single()
                .angular
                ?.declaration
                ?.elements
        ).containsExactly(AngularSelector(element = "p", attributes = mapOf("appGlow" to "")))
    }
}
