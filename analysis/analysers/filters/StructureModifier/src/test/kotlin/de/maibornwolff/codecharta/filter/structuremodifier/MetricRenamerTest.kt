package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class MetricRenamerTest {
    private lateinit var attributeDescriptorsProject: Project

    private fun doesAttributeExistInNode(node: MutableNode, attributeName: String): Boolean {
        if (node.attributes.containsKey(attributeName)) return true

        if (node.children.isEmpty()) return false

        val resultOfChildNodes = node.children.any { doesAttributeExistInNode(it, attributeName) }
        return resultOfChildNodes
    }

    @BeforeEach
    fun serializeProject() {
        val bufferedReader = File("src/test/resources/test_attributeDescriptors.cc.json").bufferedReader()
        attributeDescriptorsProject = ProjectDeserializer.deserializeProject(bufferedReader)
    }

    @Test
    fun `should rename all occurrences of mcc in the projects nodes to complexity when the project contains this metric`() {
        // given
        val bufferedReader = File("src/test/resources/merged_project.cc.json").bufferedReader()
        val sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)

        // when
        val result = MetricRenamer(sampleProject).rename()

        // then
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "mcc")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "complexity")).isTrue()
    }

    @Test
    fun `should rename all occurrences of mcc in the attributeDescriptors and attributeTypes when it is present`() {
        // when
        val result = MetricRenamer(attributeDescriptorsProject).rename()

        // then
        val attributeTypeNodes = result.attributeTypes["nodes"]!!
        Assertions.assertThat(attributeTypeNodes.containsKey("mcc")).isFalse()
        Assertions.assertThat(attributeTypeNodes.containsKey("complexity")).isTrue()

        Assertions.assertThat(result.attributeDescriptors.containsKey("mcc")).isFalse()
        Assertions.assertThat(result.attributeDescriptors.containsKey("complexity")).isTrue()
    }

    @Test
    fun `should not rename other metrics that contain mcc as part of their name`() {
        // when
        val result = MetricRenamer(attributeDescriptorsProject).rename()

        // then
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "mcc")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "ymcc")).isTrue()

        val attributeTypeNodes = result.attributeTypes["nodes"]!!
        Assertions.assertThat(attributeTypeNodes.containsKey("mcc")).isFalse()
        Assertions.assertThat(attributeTypeNodes.containsKey("ymcc")).isTrue()

        Assertions.assertThat(result.attributeDescriptors.containsKey("mcc")).isFalse()
        Assertions.assertThat(result.attributeDescriptors.containsKey("ymcc")).isTrue()
    }

    @Test
    fun `should rename mcc to sonar_complexity when specified`() {
        // when
        val result = MetricRenamer(attributeDescriptorsProject, "sonar_complexity").rename()

        // then
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "mcc")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "complexity")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "sonar_complexity")).isTrue()
    }

    @Test
    fun `should print info and not alter file when the input file did not contain mcc metric`() {
        // given
        val outContent = ByteArrayOutputStream()
        System.setOut(PrintStream(outContent))

        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        val sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)

        // when
        val result = MetricRenamer(sampleProject).rename()

        // then
        Assertions.assertThat(outContent.toString()).contains("INFO: Project has not been altered as no MCC metric was found!")
        Assertions.assertThat(result).isEqualTo(sampleProject)
    }
}
