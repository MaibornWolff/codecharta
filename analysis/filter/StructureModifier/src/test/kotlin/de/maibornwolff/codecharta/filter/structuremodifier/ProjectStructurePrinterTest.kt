package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class ProjectStructurePrinterTest {

    private lateinit var sampleProject: Project
    private val outContent = ByteArrayOutputStream()

    @BeforeEach
    fun serializeProject() {
        val bufferedReader = File("src/test/resources/sample_project.cc.json").bufferedReader()
        sampleProject = ProjectDeserializer.deserializeProject(bufferedReader)
        System.setOut(PrintStream(outContent))
    }

    @Test
    fun `Nodes on desired max hierarchy level are printed`() {
        val projectStructurePrinter = ProjectStructurePrinter(sampleProject)

        projectStructurePrinter.printProjectStructure(2)

        Assertions.assertThat(outContent.toString()).contains(listOf("root", "src", "main", "test"))
    }

    @Test
    fun `Nodes deeper than max hierarchy level are not printed`() {
        val projectStructurePrinter = ProjectStructurePrinter(sampleProject)

        projectStructurePrinter.printProjectStructure(1)

        Assertions.assertThat(outContent.toString()).doesNotContain(listOf("main", "test"))
    }

    @Test
    fun `All nodes are shown if max hierarchy is deeper that actual hierarchy`() {
        val projectStructurePrinter = ProjectStructurePrinter(sampleProject)

        projectStructurePrinter.printProjectStructure(99)

        Assertions.assertThat(outContent.toString()).contains(listOf("root", "file1.java"))
    }

    @Test
    fun `Node hierarchy levels are correct`() {
        val projectStructurePrinter = ProjectStructurePrinter(sampleProject)

        projectStructurePrinter.printProjectStructure(99)

        Assertions.assertThat(outContent.toString()).contains(listOf("root", "- src", "- - - file1.java"))
    }
}
