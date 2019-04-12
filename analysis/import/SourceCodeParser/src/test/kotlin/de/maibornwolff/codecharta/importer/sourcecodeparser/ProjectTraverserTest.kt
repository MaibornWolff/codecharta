package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File

class ProjectTraverserTest {

    @Test
    fun `should find correct number of files`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources/sampleproject").absoluteFile)
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")
        val pythonFiles = projectTraverser.getFileListByExtension("py")

        println(javaFiles)
        assertThat(javaFiles.size).isEqualTo(3)
        assertThat(pythonFiles.size).isEqualTo(1)
    }

    @Test
    fun `relative paths should be correctly formatted`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile)

        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles).contains("sampleproject/bar/foo.java", "ScriptShellSample.java")
    }

    @Test
    fun `should return empty if no such extension is found`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile)
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("unknown")

        assertThat(javaFiles.size).isEqualTo(0)
    }
}