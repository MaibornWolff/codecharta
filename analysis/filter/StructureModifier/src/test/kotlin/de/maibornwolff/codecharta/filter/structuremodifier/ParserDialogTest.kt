package de.maibornwolff.codecharta.filter.structuremodifier

import com.varabyte.kotter.foundation.input.Keys
import com.varabyte.kotterx.test.foundation.input.press
import com.varabyte.kotterx.test.foundation.testSession
import com.varabyte.kotterx.test.terminal.type
import de.maibornwolff.codecharta.filter.structuremodifier.ParserDialog.Companion.callTestFun
import de.maibornwolff.codecharta.filter.structuremodifier.ParserDialog.Companion.myCollectParserArgs
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.File
import java.nio.file.Paths
import kotlin.io.path.Path

class ParserDialogTest {
    val absolutePath = Paths.get("").toAbsolutePath().toString()
    val resourceFolder = Path(absolutePath, "/src/test/resources/")
    val sampleProjectPath = resourceFolder.resolve("sample_project.cc.json")

    @Test
    fun `should output correct arguments when print structure is selected`() {
        // given
        val printLevels = 5

        testSession { terminal ->
            // when
            val parserArguments =
            myCollectParserArgs(
                fileCallback = {
                    terminal.type(sampleProjectPath.toString())
                    terminal.press(Keys.ENTER)
                },
                actionCallback = {
                    Thread.sleep(1)
                    terminal.press(Keys.ENTER)
                },
                printCallback = {
                    terminal.type(printLevels.toString())
                    terminal.press(Keys.ENTER)
                },
            )

            // then
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
            assertThat(parseResult.matchedOption("print-levels").getValue<Int>()).isEqualTo(printLevels)
            assertThat(parseResult.matchedOption("output-file")).isNull()
            assertThat(parseResult.matchedOption("set-root")).isNull()
            assertThat(parseResult.matchedOption("move-to")).isNull()
            assertThat(parseResult.matchedOption("move-from")).isNull()
            assertThat(parseResult.matchedOption("remove")).isNull()
        }
    }

    @Test
    fun `should output correct arguments when extract path is selected`() {
        // given
        val pathToBeExtracted = "/root/src/main"
        val outputFileName = "output"

        testSession { terminal ->
            val parserArguments =
            myCollectParserArgs(
                fileCallback = {
                    terminal.type(sampleProjectPath.toString())
                    terminal.press(Keys.ENTER)
                },
                actionCallback = {
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
                },
            )

            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
            assertThat(parseResult.matchedOption("output-file").getValue<String>()).isEqualTo(outputFileName)
            assertThat(parseResult.matchedOption("set-root").getValue<String>()).isEqualTo(pathToBeExtracted)
            assertThat(parseResult.matchedOption("print-levels")).isNull()
            assertThat(parseResult.matchedOption("move-from")).isNull()
            assertThat(parseResult.matchedOption("move-to")).isNull()
            assertThat(parseResult.matchedOption("remove")).isNull()
        }
    }

    @Test
    fun `should output correct arguments when move nodes is selected`() {
        // given
        val outputFileName = "output"
        val moveFrom = "/root/src/main/java"
        val moveTo = "/root/src/main/java/subfolder"

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
                },
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
                    terminal.press(Keys.ENTER)
                },
                removeNodesCallback = {
                    terminal.type(nodeToRemove)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
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
                    terminal.press(Keys.ENTER)
                },
                removeNodesCallback = {
                    terminal.type(nodeToRemove)
                    terminal.press(Keys.ENTER)
                },
                outFileCallback = {
                    terminal.type(outputFileName)
                    terminal.press(Keys.ENTER)
                },
            )
            val commandLine = CommandLine(StructureModifier())
            val parseResult = commandLine.parseArgs(*parserArguments.toTypedArray())

            // then
            assertThat(parseResult.matchedPositional(0).getValue<File>().path).isEqualTo(sampleProjectPath.toString())
        }
    }

    @Test
    fun `test if calling the function that calls fun1 from here becomes flaky`() {
        val testString = "Long input that should test if the length has any effect on anything"
        var result: String
        testSession { terminal ->
            result =
            callTestFun(
            callback1 = {
                terminal.type(testString)
                terminal.press(Keys.ENTER)
            },
            callback2 = {
                terminal.type(testString)
                terminal.press(Keys.ENTER)
            },
            )
            assertThat(result).isEqualTo(testString + testString)
        }
    }
}
