package de.maibornwolff.codecharta.filter.structurechanger

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

        Assertions.assertThat(result).isEqualToComparingFieldByFieldRecursively(sampleProject)
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

    }

    @Test
    fun `multiple nodes are removed`() {

    }

    @Test
    fun `project name is set to specified name`() {

    }

    @Test
    fun `Affected edges are removed`() {

    }

    @Test
    fun `Affected blacklist items are removed`() {

    }
}