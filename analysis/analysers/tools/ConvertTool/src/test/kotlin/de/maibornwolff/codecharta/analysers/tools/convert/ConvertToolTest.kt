package de.maibornwolff.codecharta.analysers.tools.convert

import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ApiVersion
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class ConvertToolTest {
    private fun write15File(): File {
        val node = Node("App.kt", NodeType.File, mapOf("rloc" to 120.0))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(node))
        val project = Project("sample", listOf(root))
        val file = File.createTempFile("convert-input", ".cc.json")
        file.deleteOnExit()
        file.writeText(ProjectSerializer.serializeToString(project, ApiVersion.ONE_FIVE))
        return file
    }

    @Test
    fun `should convert a 1_5 file to the 2_0 format`() {
        val inputFile = write15File()
        val output = ByteArrayOutputStream()

        CommandLine(ConvertTool(ByteArrayInputStream(ByteArray(0)), PrintStream(output))).execute(inputFile.absolutePath)

        val rawOutput = output.toString("UTF-8")
        assertThat(rawOutput).contains("\"files\"").contains("\"lenses\"").contains("\"metrics\"")
        assertThat(ProjectDeserializer.deserializeProject(rawOutput).apiVersion).isEqualTo("2.0")
    }

    @Test
    fun `should not be applicable as a pipe target`() {
        assertThat(ConvertTool().isApplicable("anything")).isFalse()
    }
}
