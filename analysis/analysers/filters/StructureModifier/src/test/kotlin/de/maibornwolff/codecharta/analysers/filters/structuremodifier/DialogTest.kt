package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.analysers.filters.structuremodifier.Dialog.Companion.collectAnalyserArgs
import de.maibornwolff.codecharta.dialogProvider.promptList
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File
import java.nio.file.Paths
import kotlin.io.path.Path

@Timeout(120)
class DialogTest {
    private val absolutePath = Paths.get("").toAbsolutePath().toString()
    private val resourceFolder = Path(absolutePath, "/src/test/resources/")
    private val sampleProjectPath = resourceFolder.resolve("sample_project.cc.json")

    private val printLevelsFlag = "print-levels"
    private val moveToFlag = "move-to"
    private val moveFromFlag = "move-from"
    private val setRootFlag = "set-root"
    private val removeFlag = "remove"
    private val renameFlag = "rename-mcc"

    private var allModes: MutableSet<String> = mutableSetOf()

    @BeforeEach
    fun resetParameters() {
        mockkObject(Dialog.Companion)
        allModes = mutableSetOf(printLevelsFlag, moveToFlag, moveFromFlag, setRootFlag, removeFlag, renameFlag)
    }

    @AfterEach
    fun unmock() {
        unmockkAll()
    }

    @Test
    fun `should output correct arguments when print structure is selected`() {
        val printLevels = 5
        allModes.remove(printLevelsFlag)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val printCallback: suspend RunScope.() -> Unit = {
                terminal.type(printLevels.toString())
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                printCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
        assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(printLevels)
        assertThat(parseResult.matchedOption("output-file")).isNull()
        allModes.forEach {
            assertThat(parseResult.matchedOption(it)).isNull()
        }
    }

    @Test
    fun `should output correct arguments when rename mcc is selected with choice sonar_complexity`() {
        val outputFileName = "output"

        allModes.remove(renameFlag)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val collectMccCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                collectMccCallback,
                outFileCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("rename-mcc").getValue<String>()).isEqualTo("sonar")
        allModes.forEach {
            assertThat(parseResult.matchedOption(it)).isNull()
        }
    }

    @Test
    fun `should output correct arguments when rename mcc is selected with choice complexity`() {
        val outputFileName = "output"

        allModes.remove(renameFlag)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val collectMccCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                collectMccCallback,
                outFileCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("rename-mcc").getValue<String>()).isEqualTo("")
        allModes.forEach {
            assertThat(parseResult.matchedOption(it)).isNull()
        }
    }

    @Test
    fun `should output correct arguments when extract path is selected`() {
        val pathToBeExtracted = "/root/src/main"
        val outputFileName = "output"

        allModes.remove(setRootFlag)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val setRootCallback: suspend RunScope.() -> Unit = {
                terminal.type(pathToBeExtracted)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                setRootCallback,
                outFileCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(pathToBeExtracted)

        allModes.forEach {
            assertThat(parseResult.matchedOption(it)).isNull()
        }
    }

    @Test
    fun `should output correct arguments when move nodes is selected`() {
        val outputFileName = "output"
        val moveFrom = "/root/src/main/java"
        val moveTo = "/root/src/main/java/subfolder"

        allModes.removeAll(listOf(moveToFlag, moveFromFlag))

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val moveFromCallback: suspend RunScope.() -> Unit = {
                terminal.type(moveFrom)
                terminal.press(Keys.ENTER)
            }
            val moveToCallback: suspend RunScope.() -> Unit = {
                terminal.type(moveTo)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                moveFromCallback,
                moveToCallback,
                outFileCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("move-from").getValue<String>()).isEqualTo(moveFrom)
        assertThat(parseResult.matchedOption("move-to").getValue<String>()).isEqualTo(moveTo)
        assertThat(parseResult.matchedOption("print-levels")).isNull()
        assertThat(parseResult.matchedOption("set-root")).isNull()
        assertThat(parseResult.matchedOption("remove")).isNull()

        allModes.forEach {
            assertThat(parseResult.matchedOption(it)).isNull()
        }
    }

    @Test
    fun `should output correct arguments when remove nodes is selected`() {
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"
        val nodesToRemove = arrayOf(nodeToRemove)

        allModes.remove(removeFlag)

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val removeNodesCallback: suspend RunScope.() -> Unit = {
                terminal.type(nodeToRemove)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                removeNodesCallback,
                outFileCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
        assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
        assertThat(parseResult.matchedOption("remove").getValue<Array<String>>()).isEqualTo(nodesToRemove)
        assertThat(parseResult.matchedOption("print-levels")).isNull()
        assertThat(parseResult.matchedOption("move-from")).isNull()
        assertThat(parseResult.matchedOption("set-root")).isNull()
        assertThat(parseResult.matchedOption("move-to")).isNull()

        allModes.forEach {
            assertThat(parseResult.matchedOption(it)).isNull()
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        val invalidInputFileName = "fail"
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"

        var parserArguments: List<String> = listOf()

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(invalidInputFileName)
                terminal.press(Keys.ENTER)
                terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            val actionCallback: suspend RunScope.() -> Unit = {
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.DOWN)
                terminal.press(Keys.ENTER)
            }
            val removeNodesCallback: suspend RunScope.() -> Unit = {
                terminal.type(nodeToRemove)
                terminal.press(Keys.ENTER)
            }
            val outFileCallback: suspend RunScope.() -> Unit = {
                terminal.type(outputFileName)
                terminal.press(Keys.ENTER)
            }

            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback,
                actionCallback,
                removeNodesCallback,
                outFileCallback
            )

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
    }

    @Test
    fun `should return emptry list for unknown action`() {
        val unknownAction = "unknown_action"

        var parserArguments: List<String> = listOf("init")

        testSession { terminal ->

            val fileCallback: suspend RunScope.() -> Unit = {
                terminal.type(sampleProjectPath.toString())
                terminal.press(Keys.ENTER)
            }
            every { Dialog.Companion.testCallback() } returnsMany listOf(
                fileCallback
            )

            mockkStatic("de.maibornwolff.codecharta.dialogProvider.DialogProviderKt")
            every { any<Session>().promptList(any(), any(), any(), any()) } returns unknownAction

            parserArguments = collectAnalyserArgs(this)
        }

        val commandLine = CommandLine(StructureModifier())
        val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

        assertThat(parserArguments).isEmpty()
        assertThat(parseResult.expandedArgs()).isEmpty()
    }
}
