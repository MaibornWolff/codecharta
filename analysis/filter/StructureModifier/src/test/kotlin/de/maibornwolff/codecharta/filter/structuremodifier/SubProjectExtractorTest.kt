package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.File

class SubProjectExtractorTest {

    private lateinit var sampleProject: Project

    @BeforeEach
    fun serializeProject() {
        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)
    }

    @Test
    fun `Non existent path leads to empty project`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract("/root/something")

        Assertions.assertThat(result.rootNode.children.size).isEqualTo(0)
    }

    @Test
    fun `Single path is extracted`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract("root/src/test")
        println(result)

        val extractedNode = result.rootNode
        val extractedNodeChild = extractedNode.children.first()
        Assertions.assertThat(extractedNode.name).isEqualTo("root")
        Assertions.assertThat(extractedNodeChild.name).isEqualTo("otherFile.java")
    }

    @Test
    fun `Attributes of extracted nodes are kept`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract("/root/src/test")

        val extractedNodeChild = result.rootNode.children.first()
        Assertions.assertThat(extractedNodeChild.attributes).containsKey("nloc")
    }

    @Test
    fun `Only edges part of sub-project are kept`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract("/root/foo")

        val edges = result.edges
        Assertions.assertThat(edges.size).isEqualTo(1)
    }

    @Test
    fun `Edges of selected sub-project renamed`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract("/root/foo")

        val firstEdge = result.edges.first()
        Assertions.assertThat(firstEdge.toNodeName).isEqualTo("/root/file3")
        Assertions.assertThat(firstEdge.fromNodeName).isEqualTo("/root/file2")
        Assertions.assertThat(firstEdge.attributes["pairingRate"]).isEqualTo(42.0)
    }

    @Test
    fun `Subproject with no matching edges has no edges`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract("/root/something")

        val edges = result.edges
        Assertions.assertThat(edges).isEmpty()
    }
}
