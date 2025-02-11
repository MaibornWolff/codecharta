package de.maibornwolff.codecharta.filter.structuremodifier

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotter.runtime.terminal.inmemory.press
import com.varabyte.kotter.runtime.terminal.inmemory.type
import com.varabyte.kotterx.test.foundation.testSession
import de.maibornwolff.codecharta.filter.structuremodifier.ParserDialog.Companion.myCollectParserArgs
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import picocli.CommandLine
import java.io.File
import java.nio.file.Paths
import kotlin.io.path.Path

@Timeout(120)
class ParserDialogTest {
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
        allModes = mutableSetOf(printLevelsFlag, moveToFlag, moveFromFlag, setRootFlag, removeFlag, renameFlag)
    }

    @Test
    fun `should output correct arguments when print structure is selected`() {
        // given
        val printLevels = 5
        allModes.remove(printLevelsFlag)

        testSession { terminal ->
            // when
            val parserArguments =
                myCollectParserArgs(
                    fileCallback = {
                        terminal.type(sampleProjectPath.toString())
                        terminal.press(Keys.ENTER)
                    },
                    actionCallback = {
                        terminal.press(Keys.ENTER)
                    },
                    printCallback = {
                        terminal.type(printLevels.toString())
                        terminal.press(Keys.ENTER)
                    }
                )

            // then
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
            assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(printLevels)
            assertThat(parseResult.matchedOption("output-file")).isNull()
            allModes.forEach {
                assertThat(parseResult.matchedOption(it)).isNull()
            }
        }
    }

    @Test
    fun `should output correct arguments when rename mcc is selected`() {
        // given
        val outputFileName = "output"

        allModes.remove(renameFlag)

        testSession { terminal ->
            val parserArguments = myCollectParserArgs(
                fileCallback = {
                    terminal.type(sampleProjectPath.toString())
                    terminal.press(Keys.ENTER)
                },
                actionCallback = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.ENTER)
                },
                chooseNameCallback = {
                    terminal.press(Keys.DOWN)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                }
            )

            // when
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("rename-mcc").getValue<String>()).isEqualTo("sonar")
            allModes.forEach {
                assertThat(parseResult.matchedOption(it)).isNull()
            }
        }
    }

    @Test
    fun `should output correct arguments when extract path is selected`() {
        // given
        val pathToBeExtracted = "/root/src/main"
        val outputFileName = "output"

        allModes.remove(setRootFlag)

        testSession { terminal ->
            val parserArguments =
                myCollectParserArgs(
                    fileCallback = {
                        terminal.type(sampleProjectPath.toString())
                        terminal.press(Keys.ENTER)
                    },
                    actionCallback = {
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.ENTER)
                    },
                    setRootCallback = {
                        terminal.type(pathToBeExtracted)
                        terminal.press(Keys.ENTER)
                    },
                    outFileCallback = {
                        terminal.type(outputFileName)
                        terminal.press(Keys.ENTER)
                    }
                )

            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(pathToBeExtracted)

            allModes.forEach {
                assertThat(parseResult.matchedOption(it)).isNull()
            }
        }
    }

    @Test
    fun `should output correct arguments when move nodes is selected`() {
        // given
        val outputFileName = "output"
        val moveFrom = "/root/src/main/java"
        val moveTo = "/root/src/main/java/subfolder"

        allModes.removeAll(listOf(moveToFlag, moveFromFlag))

        testSession { terminal ->
            // when
            val parserArguments =
                myCollectParserArgs(
                    fileCallback = {
                        terminal.type(sampleProjectPath.toString())
                        terminal.press(Keys.ENTER)
                    },
                    actionCallback = {
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.ENTER)
                    },
                    moveFromCallback = {
                        terminal.type(moveFrom)
                        terminal.press(Keys.ENTER)
                    },
                    moveToCallback = {
                        terminal.type(moveTo)
                        terminal.press(Keys.ENTER)
                    },
                    outFileCallback = {
                        terminal.type(outputFileName)
                        terminal.press(Keys.ENTER)
                    }
                )
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
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
    }

    @Test
    fun `should output correct arguments when remove nodes is selected`() {
        // given
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"
        val nodesToRemove = arrayOf(nodeToRemove)

        testSession { terminal ->
            // when
            val parserArguments =
                myCollectParserArgs(
                    fileCallback = {
                        terminal.type(sampleProjectPath.toString())
                        terminal.press(Keys.ENTER)
                    },
                    actionCallback = {
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.ENTER)
                    },
                    removeNodesCallback = {
                        terminal.type(nodeToRemove)
                        terminal.press(Keys.ENTER)
                    },
                    outFileCallback = {
                        terminal.type(outputFileName)
                        terminal.press(Keys.ENTER)
                    }
                )
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("remove").getValue<Array<String>>()).isEqualTo(nodesToRemove)
            assertThat(parseResult.matchedOption("print-levels")).isNull()
            assertThat(parseResult.matchedOption("move-from")).isNull()
            assertThat(parseResult.matchedOption("set-root")).isNull()
            assertThat(parseResult.matchedOption("move-to")).isNull()
        }
    }

    @Test
    fun `should prompt user twice for input file when first input file is invalid`() {
        // given
        val invalidInputFileName = "fail"
        val outputFileName = "output"
        val nodeToRemove = "/root/src/main/java"

        testSession { terminal ->
            // when
            val parserArguments =
                myCollectParserArgs(
                    fileCallback = {
                        terminal.type(invalidInputFileName)
                        terminal.press(Keys.ENTER)
                        terminal.press(Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE, Keys.BACKSPACE)
                        terminal.type(sampleProjectPath.toString())
                        terminal.press(Keys.ENTER)
                    },
                    actionCallback = {
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.DOWN)
                        terminal.press(Keys.ENTER)
                    },
                    removeNodesCallback = {
                        terminal.type(nodeToRemove)
                        terminal.press(Keys.ENTER)
                    },
                    outFileCallback = {
                        terminal.type(outputFileName)
                        terminal.press(Keys.ENTER)
                    }
                )
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
        }
    }
}
