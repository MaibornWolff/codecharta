package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.File
import java.io.InputStreamReader

class NodeRemoverTest {
    private lateinit var sampleProject: Project

    companion object {
        private const val DESCRIPTOR_TEST_PATH = "test_attributeDescriptors.cc.json"
    }

    @BeforeEach
    fun serializeProject() {
        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)
    }

    @Test
    fun `Should replicate project when non existent path specified`() {
        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(arrayOf("/root/somethig"))

        // then
        Assertions.assertThat(result).usingRecursiveComparison().isEqualTo(sampleProject)
    }

    @Test
    fun `Should keep non affected nodes when removal is specified`() {
        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(arrayOf("/root/src/main"))
        val testFolder = result.rootNode.children.first().children.first()

        // then
        Assertions.assertThat(testFolder.name).isEqualTo("test")
    }

    @Test
    fun `Should remove correct nodes when single node is specified for removal`() {
        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(arrayOf("/root/src/main"))
        val srcContent = result.rootNode.children.first().children

        // then
        Assertions.assertThat(srcContent.size).isEqualTo(2)
        Assertions.assertThat(
            srcContent.map {
                it.name
            }
        ).doesNotContain("main")
    }

    @Test
    fun `Should remove correct nodes when multiple nodes are specified for removal`() {
        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(arrayOf("/root/src/main/file1.java", "root/src/folder3/"))
        val srcContent = result.rootNode.children.first().children
        val mainContent = srcContent.first().children

        // then
        Assertions.assertThat(
            srcContent.map {
                it.name
            }
        ).doesNotContain("folder3")
        Assertions.assertThat(
            mainContent.map {
                it.name
            }
        ).containsOnly("file2.java")
    }

    @Test
    fun `Should remove affected edges when removal is specified`() {
        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(arrayOf("/root/foo"))

        // then
        Assertions.assertThat(result.edges.size).isEqualTo(1)
        Assertions.assertThat(result.edges.first()).usingRecursiveComparison().isEqualTo(sampleProject.edges.last())
        Assertions.assertThat(
            result.edges.map {
                it.fromNodeName
            }
        ).doesNotContain("/root/foo")
        Assertions.assertThat(
            result.edges.map {
                it.toNodeName
            }
        ).doesNotContain("/root/foo")
    }

    @Test
    fun `Should remove affected edges when multiple removals are specified`() {
        // given
        val toExclude = arrayOf("/root/foo/file1", "root/else/")
        val shouldBeExcluded = listOf("/root/foo/file1", "root/else/file1", "root/else")

        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(toExclude)

        // then
        Assertions.assertThat(result.edges.size).isEqualTo(2)
        Assertions.assertThat(
            result.edges.map {
                it.fromNodeName
            }
        ).doesNotContainAnyElementsOf(shouldBeExcluded)
        Assertions.assertThat(
            result.edges.map {
                it.toNodeName
            }
        ).doesNotContainAnyElementsOf(shouldBeExcluded)
    }

    @Test
    fun `Should remove correct blacklist items when node removal specified`() {
        // when
        val subProjectExtractor = NodeRemover(sampleProject)
        val result = subProjectExtractor.remove(arrayOf("/root/foo"))

        // then
        Assertions.assertThat(
            result.blacklist.map {
                it.path
            }
        ).doesNotContainSubsequence("/root/foo")
    }

    @Test
    fun `Should keep attributes when only node removal specified`() {
        // given
        val input = InputStreamReader(this.javaClass.classLoader.getResourceAsStream(DESCRIPTOR_TEST_PATH)!!)
        val attributeProject = ProjectDeserializer.deserializeProject(input)

        // when
        val resultProject = NodeRemover(attributeProject).remove(arrayOf("/root/bigLeaf.ts"))

        // then
        assertEquals(attributeProject.attributeDescriptors.size, resultProject.attributeDescriptors.size)
    }

    @Test
    fun `Should remove unused attributeDescriptors when nodes are removed`() {
        // given
        val input = InputStreamReader(this.javaClass.classLoader.getResourceAsStream(DESCRIPTOR_TEST_PATH)!!)
        val attributeProject = ProjectDeserializer.deserializeProject(input)

        // when
        val resultProject = NodeRemover(attributeProject).remove(arrayOf("/root/AnotherParentLeaf"))

        // then
        assertEquals(resultProject.attributeDescriptors.size, 3)
        assertEquals(resultProject.attributeDescriptors["rloc"]!!.description, "1")
        assertEquals(resultProject.attributeDescriptors["yrloc"], null)
    }

    @Test
    fun `Should correctly remove node when another node in a different subfolder has the same name`() {
        // given
        val bufferedReader = File("src/test/resources/merged_project.cc.json").bufferedReader()
        val mergedProject = ProjectDeserializer.deserializeProject(bufferedReader)
        val subProjectExtractor = NodeRemover(mergedProject)
        val pathToRemove = "/root/src/test/java/io"

        // when
        val result = subProjectExtractor.remove(arrayOf(pathToRemove))
        val folderToKeep =
            result.rootNode.children.find {
                it.name == "src"
            }?.children?.find {
                it.name == "main"
            }?.children?.find {
                it.name == "java"
            }?.children?.find {
                it.name == "io"
            }
        val folderToRemove =
            result.rootNode.children.find {
                it.name == "src"
            }?.children?.find {
                it.name == "test"
            }?.children?.find {
                it.name == "java"
            }?.children?.find {
                it.name == "io"
            }

        // then
        Assertions.assertThat(folderToKeep).isNotNull()
        Assertions.assertThat(folderToRemove).isNull()
    }
}
