package de.maibornwolff.codecharta.filter.structuremodifier

import org.assertj.core.api.Assertions
import org.junit.Ignore
import org.junit.jupiter.api.Test
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

class StructureModifierTest {
    @Test
    fun `reads project from file`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-r=/does/not/exist"))

        Assertions.assertThat(cliResult).contains(listOf("MyProject", "otherFile.java"))
    }

    @Test
    fun `reads project piped input`() {
        val input = File("src/test/resources/sample_project.cc.json").bufferedReader().readLines().joinToString(separator = "") { it }

        val cliResult = executeForOutput(input, arrayOf("-r=/does/not/exist"))

        Assertions.assertThat(cliResult).contains(listOf("MyProject", "otherFile.java"))
    }

    @Test
    fun `processes only valid project files`() {
        val originalError = System.err
        val errorStream = ByteArrayOutputStream()
        System.setErr(PrintStream(errorStream))

        executeForOutput("", arrayOf("src/test/resources/invalid_project.cc.json", "-p=2"))
        System.setErr(originalError)

        Assertions.assertThat(errorStream.toString()).contains("invalid_project.cc.json is not a valid project")
    }

    @Ignore
    @Test
    fun `reads project piped input multiline`() {
        val input = File("src/test/resources/sample_project.cc.json").bufferedReader().readLines().joinToString(separator = "\n") { it }
        val cliResult = executeForOutput(input, arrayOf("-r=/does/not/exist"))

        Assertions.assertThat(cliResult).contains(listOf("MyProject", "otherFile.java"))
    }

    @Test
    fun `returns error for malformed piped input`() {
        val originalError = System.err
        val errorStream = ByteArrayOutputStream()
        System.setErr(PrintStream(errorStream))
        val input = "{this: 12}"

        executeForOutput(input, arrayOf("-r=/does/not/exist"))

        System.setErr(originalError)

        Assertions.assertThat(errorStream.toString()).contains("The piped input is not a valid project")
    }

    @Test
    fun `sets root for new subproject`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-s=/root/src/folder3"))

        Assertions.assertThat(cliResult).contains("otherFile2.java")
        Assertions.assertThat(cliResult).doesNotContain(listOf("src", "otherFile.java", "folder3"))
    }

    @Test
    fun `removes nodes`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-r=/root/src"))

        Assertions.assertThat(cliResult).contains(listOf("MyProject", "root"))
        Assertions.assertThat(cliResult).doesNotContain(listOf("src", "otherFile.java"))
    }

    @Test
    fun `moves nodes`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-f=/root/src", "-t=/root/new123"))

        Assertions.assertThat(cliResult).contains("new123")
        Assertions.assertThat(cliResult).doesNotContain("src")
    }

    @Test
    fun `prints structure`() {
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-p=2"))

        Assertions.assertThat(cliResult).contains(listOf("MyProject", "folder3", "- - "))
    }
}