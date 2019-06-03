package de.maibornwolff.codecharta.filter.structurechanger

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

        val result = subProjectExtractor.extract(arrayOf("/root/somethig"), null)

        Assertions.assertThat(result.rootNode.children.size).isEqualTo(0)
    }

    @Test
    fun `Single path is extracted`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/src/test"), null)

        val extractedNode = result.rootNode.children.first()
        val extractedNodeChild = extractedNode.children.first()
        Assertions.assertThat(extractedNode.name).isEqualTo("test")
        Assertions.assertThat(extractedNodeChild.name).isEqualTo("otherFile.java")
    }

    @Test
    fun `Multiple paths are extracted`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/src/main", "root/src/folder3"), null)

        Assertions.assertThat(result.rootNode.children.size).isEqualTo(2)
        val firstChildrenNames = result.rootNode.children.map { it.name }
        Assertions.assertThat(firstChildrenNames).containsAll(listOf("main", "folder3"))
    }

    @Test
    fun `Attributes of extracted nodes are kept`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/src/test"), null)

        val extractedNode = result.rootNode.children.first()
        val extractedNodeChild = extractedNode.children.first()
        Assertions.assertThat(extractedNodeChild.attributes).containsKey("nloc")
    }

    @Test
    fun `Project name is changed if provided`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/somethig"), "foo")

        Assertions.assertThat(result.projectName).isEqualTo("foo")
    }

    @Test
    fun `Project name is kept if not provided`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/somethig"), null)

        Assertions.assertThat(result.projectName).isEqualTo(sampleProject.projectName)
    }

    @Test
    fun `Only edges part of sub-project are kept`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/foo"), null)

        val edges = result.edges
        Assertions.assertThat(edges.size).isEqualTo(1)
    }

    @Test
    fun `Edges of selected subproject renammed`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/foo"), null)

        val firstEdge = result.edges.first()
        Assertions.assertThat(firstEdge.toNodeName).isEqualTo("/file3")
        Assertions.assertThat(firstEdge.fromNodeName).isEqualTo("/file2")
        Assertions.assertThat(firstEdge.attributes["pairingRate"]).isEqualTo(42.0)
    }

    @Test
    fun `Subproject with no matching edges has no edges`() {
        val subProjectExtractor = SubProjectExtractor(sampleProject)

        val result = subProjectExtractor.extract(arrayOf("/root/something"), null)

        val edges = result.edges
        Assertions.assertThat(edges).isEmpty()
    }
}