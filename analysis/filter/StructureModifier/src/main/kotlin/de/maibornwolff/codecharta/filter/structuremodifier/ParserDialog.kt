package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            var inputFileName: String
            var result: List<String> = listOf()

            // temporary test for kotter methods TODO: remove
            println("before tester")
            var test = listOf<String>()
            session {
                println("inside tester")
                myPromptInput(
                        "Input a test input:",
                        Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json",
                        allowEmptyInput = true,
                        inputValidator = InputValidator.isInputAnExistingFile()
                )
                myPromptInputNumber(
                        "input a test number:",
                        "42",
                        inputValidator = InputValidator.isInputBetweenNumbers(0, 5)
                )
                myPromptConfirm("Confirm the test?")
                myPromptList("select any", listOf("a", "b", "c", "1", "2", "3"))
                test = myPromptCheckbox("Select all parsers you want to execute:", listOf("a", "b", "c", "1", "2", "3"))
            }
            println(test)
            println("after tester")

            println("test before session")
            session {
                println("test inside session")
                do {
                    inputFileName = myPromptInput(
                            message = "What is the cc.json file that has to be modified?",
                            hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json"
                    )
                } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false))

                val selectedAction: String = myPromptList(
                        message = "Which action do you want to perform?",
                        choices = listOf(
                                StructureModifierAction.PRINT_STRUCTURE.descripton,
                                StructureModifierAction.SET_ROOT.descripton,
                                StructureModifierAction.MOVE_NODES.descripton,
                                StructureModifierAction.REMOVE_NODES.descripton
                        )
                )

                result = when (selectedAction) {
                    StructureModifierAction.PRINT_STRUCTURE.descripton -> listOf(inputFileName, *collectPrintArguments())
                    StructureModifierAction.SET_ROOT.descripton -> listOf(inputFileName, *collectSetRootArguments())
                    StructureModifierAction.MOVE_NODES.descripton -> listOf(inputFileName, *collectMoveNodesArguments())
                    StructureModifierAction.REMOVE_NODES.descripton -> listOf(inputFileName, *collectRemoveNodesArguments())
                    else -> listOf()
                }
            }
            println("test after session")
            return result
        }
    }
}

private fun Session.collectPrintArguments(): Array<String> { //diese funktionen als extension vom section scope setzen? können wir sie dann noch private lassen?
    val printLevels: String =
            myPromptInputNumber(message = "How many print levels do you want to print?", hint = "0")
    return arrayOf("--print-levels=$printLevels")
}

private fun Session.collectSetRootArguments(): Array<String> {
    val setRoot: String =
            myPromptInput(message = "What path within the project should be extracted as the new root?")
    val outputFileName = collectOutputFileName()
    return arrayOf("--set-root=$setRoot", "--output-file=$outputFileName")
}

private fun Session.collectMoveNodesArguments(): Array<String> {
    val moveFrom: String =
            myPromptInput(message = "What path should be moved (contained children will be moved as well)?")
    val moveTo: String =
            myPromptInput(message = "What is the target path to move them?")
    val outputFileName = collectOutputFileName()
    return arrayOf("--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
}

private fun Session.collectRemoveNodesArguments(): Array<String> {
    val remove: String =
            myPromptInput(message = "What are the paths of the nodes to be removed?")
    val outputFileName = collectOutputFileName()
    return arrayOf("--remove=$remove", "--output-file=$outputFileName")
}

private fun collectOutputFileName(): String {
    return KInquirer.promptInput(message = "What is the name of the output file?")
}
