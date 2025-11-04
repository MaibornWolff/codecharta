package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ThresholdValidatorTest {
    @Test
    fun `should return empty list when no violations exist`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 500))
        )
        val project = createProject(
            createFile("File.kt", mapOf("rloc" to 100))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should detect min threshold violation`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("coverage" to MetricThreshold(min = 80))
        )
        val project = createProject(
            createFile("File.kt", mapOf("coverage" to 50))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).hasSize(1)
        assertThat(violations[0].path).isEqualTo("root/File.kt")
        assertThat(violations[0].metricName).isEqualTo("coverage")
        assertThat(violations[0].actualValue).isEqualTo(50)
        assertThat(violations[0].violationType).isEqualTo(ViolationType.BELOW_MIN)
    }

    @Test
    fun `should detect max threshold violation`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("complexity" to MetricThreshold(max = 50))
        )
        val project = createProject(
            createFile("File.kt", mapOf("complexity" to 100))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).hasSize(1)
        assertThat(violations[0].path).isEqualTo("root/File.kt")
        assertThat(violations[0].metricName).isEqualTo("complexity")
        assertThat(violations[0].actualValue).isEqualTo(100)
        assertThat(violations[0].violationType).isEqualTo(ViolationType.ABOVE_MAX)
    }

    @Test
    fun `should detect multiple metric violations in single file`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(max = 100),
                "mcc" to MetricThreshold(max = 10)
            )
        )
        val project = createProject(
            createFile("File.kt", mapOf("rloc" to 200, "mcc" to 20))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).hasSize(2)
        assertThat(violations.map { it.metricName }).containsExactlyInAnyOrder("rloc", "mcc")
    }

    @Test
    fun `should not violate when value equals threshold`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf(
                "rloc" to MetricThreshold(min = 10, max = 100)
            )
        )
        val project = createProject(
            createFile("File.kt", mapOf("rloc" to 100))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should handle nested folder structure`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val folder = createFolder(
            "src",
            createFolder(
                "main",
                createFile("File.kt", mapOf("rloc" to 200))
            )
        )
        val project = createProject(folder)
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).hasSize(1)
        assertThat(violations[0].path).isEqualTo("root/src/main/File.kt")
    }

    @Test
    fun `should validate multiple files in project`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val folder = createFolder(
            "src",
            createFile("File1.kt", mapOf("rloc" to 150)),
            createFile("File2.kt", mapOf("rloc" to 50)),
            createFile("File3.kt", mapOf("rloc" to 200))
        )
        val project = createProject(folder)
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).hasSize(2)
        assertThat(violations.map { it.path })
            .containsExactlyInAnyOrder("root/src/File1.kt", "root/src/File3.kt")
    }

    @Test
    fun `should not violate when file has no metrics`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val project = createProject(
            createFile("File.kt", emptyMap())
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should not violate when file missing specific metric`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val project = createProject(
            createFile("File.kt", mapOf("other_metric" to 500))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should skip non-file node types`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val classNode = MutableNode("MyClass", NodeType.Class, mapOf("rloc" to 200))
        val methodNode = MutableNode("myMethod", NodeType.Method, mapOf("rloc" to 200))
        val packageNode = MutableNode("package", NodeType.Package, mapOf("rloc" to 200))
        val folder = createFolder("src", classNode, methodNode, packageNode)
        val project = createProject(folder)
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should handle empty project`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val project = ProjectBuilder().build()
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should handle project with only folders`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val folder = createFolder("src", createFolder("main"))
        val project = createProject(folder)
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should handle non-numeric attribute values`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 100))
        )
        val file = MutableNode("File.kt", NodeType.File, mapOf("rloc" to "not a number"))
        val project = createProject(file)
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    @Test
    fun `should handle decimal metric values`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("coverage" to MetricThreshold(min = 80.0))
        )
        val project = createProject(
            createFile("File.kt", mapOf("coverage" to 75.5))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).hasSize(1)
        assertThat(violations[0].actualValue).isEqualTo(75.5)
    }

    @Test
    fun `should construct correct path for root-level file`() {
        // Arrange
        val config = ThresholdConfiguration(
            fileMetrics = mapOf("rloc" to MetricThreshold(max = 10))
        )
        val project = createProject(
            createFile("File.kt", mapOf("rloc" to 100))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations[0].path).isEqualTo("root/File.kt")
    }

    @Test
    fun `should validate with empty configuration`() {
        // Arrange
        val config = ThresholdConfiguration(fileMetrics = emptyMap())
        val project = createProject(
            createFile("File.kt", mapOf("rloc" to 1000))
        )
        val validator = ThresholdValidator(config)

        // Act
        val violations = validator.validate(project)

        // Assert
        assertThat(violations).isEmpty()
    }

    // Helper functions to create test data
    private fun createFile(name: String, attributes: Map<String, Any>): MutableNode {
        return MutableNode(name, NodeType.File, attributes)
    }

    private fun createFolder(name: String, vararg children: MutableNode): MutableNode {
        val folder = MutableNode(name, NodeType.Folder)
        children.forEach { folder.children.add(it) }
        return folder
    }

    private fun createProject(vararg nodes: MutableNode): Project {
        val projectBuilder = ProjectBuilder()
        nodes.forEach { projectBuilder.rootNode.children.add(it) }
        return projectBuilder.build()
    }
}
