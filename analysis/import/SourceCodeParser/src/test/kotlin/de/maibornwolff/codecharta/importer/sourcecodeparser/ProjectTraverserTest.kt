package de.maibornwolff.codecharta.importer.sourcecodeparser

import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.io.File

class ProjectTraverserTest {

    @Test
    fun checkFileAssignment() {
        val projectTraverser = ProjectTraverser(File("src/test/resources").absoluteFile)
        projectTraverser.traverse()
        val javaFiles = projectTraverser.getFileListByExtension("java")

        assertThat(javaFiles.size).isEqualTo(12)
    }
}