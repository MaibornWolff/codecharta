package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.File

class NodeRemoverTest {
    private lateinit var sampleProject: Project

    @BeforeEach
    fun serializeProject() {
        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)
    }

    @Test
    fun `Non existent path leads to replication of the project`() {
        val subProjectExtractor = NodeRemover(sampleProject)

        val result = subProjectExtractor.remove(arrayOf("/root/somethig"))

        Assertions.assertThat(result).usingRecursiveComparison().isEqualTo(sampleProject)
    }

    @Test
    fun `Non affected nodes are kept`() {
        val subProjectExtractor = NodeRemover(sampleProject)

        val result = subProjectExtractor.remove(arrayOf("/root/src/main"))

        val testFolder = result.rootNode.children.first().children.first()
        Assertions.assertThat(testFolder.name).isEqualTo("test")
    }

    @Test
    fun `specified nodes are removed`() {
        val subProjectExtractor = NodeRemover(sampleProject)

        val result = subProjectExtractor.remove(arrayOf("/root/src/main"))

        val srcContent = result.rootNode.children.first().children
        Assertions.assertThat(srcContent.size).isEqualTo(2)
        Assertions.assertThat(srcContent.map { it.name }).doesNotContain("main")
    }

    @Test
    fun `multiple nodes are removed`() {
        val subProjectExtractor = NodeRemover(sampleProject)

        val result = subProjectExtractor.remove(arrayOf("/root/src/main/file1.java", "root/src/folder3/"))

        val srcContent = result.rootNode.children.first().children
        val mainContent = srcContent.first().children
        Assertions.assertThat(srcContent.map { it.name }).doesNotContain("folder3")
        Assertions.assertThat(mainContent.map { it.name }).containsOnly("file2.java")
    }

    @Test
    fun `Affected edges are removed`() {
        val subProjectExtractor = NodeRemover(sampleProject)

        val result = subProjectExtractor.remove(arrayOf("/root/foo"))

        Assertions.assertThat(result.edges.size).isEqualTo(1)
        Assertions.assertThat(result.edges.first()).usingRecursiveComparison().isEqualTo(sampleProject.edges.last())
        Assertions.assertThat(result.edges.map { it.fromNodeName }).doesNotContain("/root/foo")
        Assertions.assertThat(result.edges.map { it.toNodeName }).doesNotContain("/root/foo")
    }

    @Test
    fun `Affected edges are removed for multiple removals`() {
        val subProjectExtractor = NodeRemover(sampleProject)
        val toExclude = arrayOf("/root/foo/file1", "root/else/")

        val result = subProjectExtractor.remove(toExclude)

        val shouldBeExcluded = listOf("/root/foo/file1", "root/else/file1", "root/else")
        Assertions.assertThat(result.edges.size).isEqualTo(2)
        Assertions.assertThat(result.edges.map { it.fromNodeName }).doesNotContainAnyElementsOf(shouldBeExcluded)
        Assertions.assertThat(result.edges.map { it.toNodeName }).doesNotContainAnyElementsOf(shouldBeExcluded)
    }

    @Test
    fun `Affected blacklist items are removed`() {
        val subProjectExtractor = NodeRemover(sampleProject)

        val result = subProjectExtractor.remove(arrayOf("/root/foo"))

        Assertions.assertThat(result.blacklist.map { it.path }).doesNotContainSubsequence("/root/foo")
    }
}