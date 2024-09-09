package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.File

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
        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        val sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)

        val result = MetricRenamer(sampleProject).rename()

        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "mcc")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "complexity")).isTrue()
    }

    @Test
    fun `should rename all occurrences of mcc in the attributeDescriptors and attributeTypes when it is present`() {
        val result = MetricRenamer(attributeDescriptorsProject).rename()

        val attributeTypeNodes = result.attributeTypes["nodes"]!!
        Assertions.assertThat(attributeTypeNodes.containsKey("mcc")).isFalse()
        Assertions.assertThat(attributeTypeNodes.containsKey("complexity")).isTrue()

        Assertions.assertThat(result.attributeDescriptors.containsKey("mcc")).isFalse()
        Assertions.assertThat(result.attributeDescriptors.containsKey("complexity")).isTrue()
    }


    @Test
    fun `should not rename other metrics that contain mcc as part of their name`() {
        val result = MetricRenamer(attributeDescriptorsProject).rename()

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
        val result = MetricRenamer(attributeDescriptorsProject, "sonar_complexity").rename()

        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "mcc")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "complexity")).isFalse()
        Assertions.assertThat(doesAttributeExistInNode(result.rootNode.toMutableNode(), "sonar_complexity")).isTrue()
    }

    @Test   //TODO: revisit
    fun `should do something if the input file did not contain mcc metric`() {
        Assertions.assertThat(true).isFalse()
    }

}
