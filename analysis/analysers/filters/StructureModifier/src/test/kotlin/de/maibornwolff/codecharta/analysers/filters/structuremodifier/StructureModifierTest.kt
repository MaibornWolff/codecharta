package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.util.InputHelper
import de.maibornwolff.codecharta.util.Logger
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class StructureModifierTest {
    private val errContent = ByteArrayOutputStream()
    private val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
        errContent.flush()
    }

    @Test
    fun `should read project when provided with input file`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-r=/does/not/exist"))

        // then
        assertThat(cliResult).contains(listOf("otherFile.java"))
    }

    @Test
    fun `should read project when receiving piped input`() {
        // given
        val inputFilePath = "src/test/resources/sample_project.cc.json"
        val input =
            File(inputFilePath).bufferedReader().readLines().joinToString(separator = "") {
                it
            }

        // when
        val cliResult = executeForOutput(input, arrayOf("-r=/does/not/exist"))

        // then
        assertThat(cliResult).contains(listOf("otherFile.java"))
    }

    @Test
    fun `should not produce output when provided with invalid project file`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput("", arrayOf("src/test/resources/invalid_project.cc.json", "-p=2"))

        // then
        assertThat(errContent.toString()).contains("invalid_project.cc.json could not be read")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should exit with a non-zero code when the named input file cannot be read`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        val exitCode = CommandLine(StructureModifier()).execute("src/test/resources/invalid_project.cc.json")

        // then
        assertThat(exitCode).isNotEqualTo(0)

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should return error when given malformed piped input`() {
        // given
        val input = "{this: 12}"
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput(input, arrayOf("-r=/does/not/exist"))

        // then
        assertThat(errContent.toString()).contains("The piped input is not a valid project")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should set the root for new subproject when provided with new root`() {
        // when
        val cliResult =
            executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-s=/root/src/folder3"))

        // then
        assertThat(cliResult).contains("otherFile2.java")
        assertThat(cliResult).doesNotContain(listOf("src", "otherFile.java", "folder3"))
    }

    @Test
    fun `should remove single node when given single folder to remove`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-r=/root/src"))

        // then
        assertThat(cliResult).contains(listOf("root"))
        assertThat(cliResult).doesNotContain(listOf("src", "otherFile.java"))
    }

    @Test
    fun `should move nodes when move-from flag is specified`() {
        // when
        val cliResult =
            executeForOutput(
                "",
                arrayOf("src/test/resources/sample_project.cc.json", "-f=/root/src", "-t=/root/new123")
            )

        // then
        assertThat(cliResult).contains("new123")
        assertThat(cliResult).doesNotContain("src")
    }

    @Test
    fun `should print structure accordingly when print-level is set`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "-p=2"))

        // then
        assertThat(cliResult).contains(listOf("folder3", "- - "))
    }

    @Test
    fun `should set root and remove unused descriptors when root specified`() {
        // when
        val cliResult =
            executeForOutput(
                "",
                arrayOf("src/test/resources/test_attributeDescriptors.cc.json", "-s=/root/AnotherParentLeaf")
            )
        val resultProject = ProjectDeserializer.deserializeProject(cliResult)

        // then
        assertThat(resultProject.lenses.allAttributeDescriptors().size).isEqualTo(3)
        assertThat(resultProject.lenses.allAttributeDescriptors()["rloc"]).isNull()
    }

    @Test
    fun `should remove nodes and unused descriptors when provided with an input file containing unused descriptors`() {
        // when
        val cliResult =
            executeForOutput(
                "",
                arrayOf("src/test/resources/test_attributeDescriptors.cc.json", "-r=/root/AnotherParentLeaf")
            )
        val resultProject = ProjectDeserializer.deserializeProject(cliResult)

        // then
        assertThat(resultProject.lenses.allAttributeDescriptors().size).isEqualTo(3)
        assertThat(resultProject.lenses.allAttributeDescriptors()["yrloc"]).isNull()
    }

    @Test
    fun `should stop execution when input file is invalid`() {
        // given
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false
        System.setErr(PrintStream(errContent))

        // when
        CommandLine(StructureModifier()).execute("thisDoesNotExist.cc.json").toString()

        // then
        assertThat(errContent.toString()).contains("Input invalid file for StructureModifier, stopping execution")

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should remove all specified nodes when multiple values are provided for the remove flag`() {
        // given
        val file1 = "/root/src/main/file1.java"
        val file2 = "/root/src/main/file2.java"
        val nodesToRemove = listOf(file1, file2)

        // when
        val cliResult =
            executeForOutput("", arrayOf("src/test/resources/sample_project.cc.json", "--remove", "$nodesToRemove"))

        // then
        assertThat(cliResult).doesNotContain(file1)
        assertThat(cliResult).doesNotContain(file2)
    }

    @Test
    fun `should log warning when more than one action is specified`() {
        // given
        val file1 = "/root/src/main/file1.java"
        val file2 = "/root/src/main/file2.java"
        val nodesToRemove = listOf(file1, file2)

        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.error(capture(lambdaSlot)) } returns Unit

        // when
        executeForOutput(
            "",
            arrayOf(
                "src/test/resources/sample_project.cc.json",
                "--remove",
                "$nodesToRemove",
                "--set-root",
                "$nodesToRemove"
            )
        )

        // then
        assertThat(lambdaSlot.last()().isNotEmpty()).isTrue()
    }

    @Test
    fun `should log error when move-from but not move-to is specified`() {
        // given
        val folderToMove = "/root/src/main"

        val lambdaSlot = mutableListOf<() -> String>()
        mockkObject(Logger)
        every { Logger.error(capture(lambdaSlot)) } returns Unit

        // when
        executeForOutput(
            "",
            arrayOf("src/test/resources/sample_project.cc.json", "--move-from", folderToMove, "--move-to", "")
        )

        // then
        assertThat(lambdaSlot.last()().isNotEmpty()).isTrue()
    }

    @Test
    fun `should rename mcc to complexity when rename flag is specified`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/merged_project.cc.json", "--rename-mcc"))

        // then
        assertThat(cliResult).doesNotContain("mcc")
        assertThat(cliResult).contains("complexity")
        assertThat(cliResult).doesNotContain("sonar_complexity")
    }

    @Test
    fun `should rename mcc to sonar_complexity when rename flag is specified with sonar option`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/merged_project.cc.json", "--rename-mcc=sonar"))

        // then
        assertThat(cliResult).doesNotContain("mcc")
        assertThat(cliResult).contains("sonar_complexity")
    }

    @Test
    fun `should refuse to set a new root when a data-bearing opaque lens would be invalidated`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        val cliResult = executeForOutput("", arrayOf(DOMAIN_PROJECT, "-s=/root/src"))

        // then
        assertThat(errContent.toString()).contains(
            "Cannot restructure this project: opaque lens(es) domain reference node ids"
        )
        assertThat(cliResult).isEmpty()

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should refuse to move nodes when a data-bearing opaque lens would be invalidated`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        val cliResult = executeForOutput("", arrayOf(DOMAIN_PROJECT, "-f=/root/src/main", "-t=/root/moved"))

        // then
        assertThat(errContent.toString()).contains("Cannot restructure this project")
        assertThat(cliResult).isEmpty()

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should refuse to remove nodes when a data-bearing opaque lens would be invalidated`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        val cliResult = executeForOutput("", arrayOf(DOMAIN_PROJECT, "-r=/root/src/main"))

        // then
        assertThat(errContent.toString()).contains("Cannot restructure this project")
        assertThat(cliResult).isEmpty()

        // clean up
        System.setErr(originalErr)
    }

    @Test
    fun `should exit non-zero when it refuses to restructure`() {
        // when
        val exitCode = CommandLine(StructureModifier()).execute(DOMAIN_PROJECT, "-s=/root/src")

        // then
        assertThat(exitCode).isEqualTo(1)
    }

    @Test
    fun `should restructure a project whose opaque lens is an empty reserved slot`() {
        // when
        val cliResult = executeForOutput("", arrayOf("src/test/resources/sample_project_with_empty_domain.cc.json", "-s=/root/src"))

        // then
        assertThat(cliResult).contains("otherFile.java")
    }

    @Test
    fun `should rename a metric on a project carrying a data-bearing opaque lens`() {
        // when
        val cliResult = executeForOutput("", arrayOf(DOMAIN_PROJECT, "--rename-mcc"))

        // then
        assertThat(cliResult).contains("invoice")
        assertThat(cliResult).doesNotContain("Cannot restructure")
    }

    @Test
    fun `should throw Exception when rename flag is specified with an invalid option`() {
        // given
        System.setErr(PrintStream(errContent))

        // when
        executeForOutput("", arrayOf("src/test/resources/merged_project.cc.json", "--rename-mcc=invalid"))

        // then
        assertThat(errContent.toString()).contains("Invalid value for rename flag, stopping execution...")

        // clean up
        System.setErr(originalErr)
    }

    companion object {
        private const val DOMAIN_PROJECT = "src/test/resources/sample_project_with_domain.cc.json"
    }
}
