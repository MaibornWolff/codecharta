package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.File

class FolderMoverTest {

    private lateinit var sampleProject: Project

    @BeforeEach
    fun serializeProject() {
        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)
    }

    @Test
    fun `should remove the source node`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/src/folder3", "/root/foo")

        val srcChildren = result!!.rootNode.children.first().children
        Assertions.assertThat(srcChildren.size).isEqualTo(2)
        Assertions.assertThat(srcChildren.filter { it.name == "folder3" }).isEmpty()

    }

    @Test
    fun `should move nothing if source node is not found`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/does/not/exist", "/something")

        Assertions.assertThat(result).isEqualToComparingFieldByFieldRecursively(sampleProject)
    }

    @Test
    fun `should return nothing if destination folder is null`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/src/folder3", null)

        Assertions.assertThat(result).isNull()
    }

    @Test
    fun `should merge content of source folder into existing folder, if existent`() {
        serializeProject()
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/src/folder3", "/root/src/test")

        val destinationNode = result!!.rootNode.children.first().children.filter { it.name == "test" }.first()
        val destinationNodeChildrenName = destinationNode.children.map { it.name }
        Assertions.assertThat(destinationNodeChildrenName).containsAll(listOf("otherFile2.java", "otherFile.java"))
    }

    @Test
    fun `should place content in newly created node, if destination does not exist`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/src/folder3", "/root/foo")

        val destinationNode = result!!.rootNode.children.filter { it.name == "foo" }.first()
        val destinationNodeChild = destinationNode.children.first()
        Assertions.assertThat(destinationNode.name).isEqualTo("foo")
        Assertions.assertThat(destinationNodeChild.name).isEqualTo("otherFile2.java")
    }

    @Test
    fun `should copy unaffected edges`() {
        val folderMover = FolderMover(sampleProject, null)
        val unaffectedEdge = sampleProject.edges[3]

        val result = folderMover.move("/root/foo/", "/root/bar")

        Assertions.assertThat(result!!.edges).contains(unaffectedEdge)

    }

    @Test
    fun `should alter from and to node of affected edges`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/foo", "root/bar/")!!

        val firstEdge = result.edges[0]
        val secondEdge = result.edges[1]
        val thirdEdge = result.edges[2]
        Assertions.assertThat(firstEdge.toNodeName).isEqualTo("/root/bar/file2")
        Assertions.assertThat(secondEdge.fromNodeName).isEqualTo("/root/bar/file1")
        Assertions.assertThat(thirdEdge.toNodeName).isEqualTo("/root/bar/file3")
        Assertions.assertThat(thirdEdge.fromNodeName).isEqualTo("/root/bar/file2")
    }

    @Test
    fun `should only alter to node of affected edges`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/foo", "/root/bar")!!

        val firstEdge = result.edges[0]
        val secondEdge = result.edges[1]
        Assertions.assertThat(firstEdge.fromNodeName).isEqualTo("/root/file1")
        Assertions.assertThat(secondEdge.toNodeName).isEqualTo("/root/file2")
    }

    @Test
    fun `should change path of relevant blacklist items`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/foo", "/root/bar")!!

        val blacklist = result.blacklist
        Assertions.assertThat(blacklist.size).isEqualTo(2)
        Assertions.assertThat(blacklist[0].path).isEqualTo("/root/bar/file1")
        Assertions.assertThat(blacklist[1].path).isEqualTo("/root/whatever/file2")
    }

    @Test
    fun `should be able to move from root`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root", "/root/new")

        val destinationNode = result!!.rootNode.children.filter { it.name == "new" }.first()
        val destinationNodeChild = destinationNode.children.first()
        Assertions.assertThat(destinationNode.name).isEqualTo("new")
        Assertions.assertThat(destinationNodeChild.name).isEqualTo("src")
    }

    @Test
    fun `should be able to move to root`() {
        val folderMover = FolderMover(sampleProject, null)

        val result = folderMover.move("/root/src", "/root")

        val destinationNode = result!!.rootNode.children.filter { it.name == "main" }.first()
        val destinationNodeChild = destinationNode.children.first()
        Assertions.assertThat(destinationNode.name).isEqualTo("main")
        Assertions.assertThat(destinationNodeChild.name).isEqualTo("file1.java")
    }
}