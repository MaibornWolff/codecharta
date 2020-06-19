package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File

class ProjectTraverserTest {

    @Test
    fun `should find correct number of files`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources/sampleproject").absoluteFile, arrayOf("/build/", "/\\..*/"))
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")
        val pythonFiles = projectTraverser.getFileListByExtension("py")

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

    @Test
    fun `should add file when file is provided as root`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources/ScriptShellSample.java"))
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles.size).isEqualTo(1)
    }

    @Test
    fun `should exclude files in ignored folders`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile, arrayOf("bar"))
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles).contains("ScriptShellSample.java")
        assertThat(javaFiles).doesNotContain("sampleproject/bar/foo.java")
    }

    @Test
    fun `should exclude files in multiple ignored folders`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile, arrayOf("/bar/", "/sonar_issues_java/"))
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles).doesNotContain("sonar_issues_java/Clean.java")
        assertThat(javaFiles).doesNotContain("sampleproject/bar/foo.java")
    }

    @Test
    fun `should exclude files where prefix matches`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile, arrayOf("/sonar_.*/"))
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles).doesNotContain("sonar_issues_java/Clean.java")
    }

    @Test
    fun `should exclude files where suffix matches`() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile, arrayOf("bar", "/.*.java"))
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles).isEmpty()
    }
}