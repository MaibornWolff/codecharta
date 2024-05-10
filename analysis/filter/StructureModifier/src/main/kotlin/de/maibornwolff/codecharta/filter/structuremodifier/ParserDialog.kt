package de.maibornwolff.codecharta.filter.structuremodifier

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.testFun1
import de.maibornwolff.codecharta.tools.inquirer.testFun2
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {
    override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        fun Session.callTestFun(
            callback1: suspend RunScope.() -> Unit = {},
            callback2: suspend RunScope.() -> Unit = {},
        ): String {
            val result1: String =
                testFun1(
//                    message = "any test meessage",
                    callback = callback1,
                )
            val result2: String =
                testFun2(
                    callback = callback2,
                )

            return result1 + result2
        }

        // TODO: check if its a problem that this is in a companion object
        internal fun Session.myCollectParserArgs(
        fileCallback: suspend RunScope.() -> Unit = {},
        actionCallback: suspend RunScope.() -> Unit = {},
        printCallback: suspend RunScope.() -> Unit = {},
        setRootCallback: suspend RunScope.() -> Unit = {},
        moveFromCallback: suspend RunScope.() -> Unit = {},
        moveToCallback: suspend RunScope.() -> Unit = {},
        removeNodesCallback: suspend RunScope.() -> Unit = {},
        outFileCallback: suspend RunScope.() -> Unit = {},
        ): List<String> {
            val result: List<String>

            val inputFileName: String =
            myPromptInput(
                message = "What is the cc.json file that should be modified?",
                hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json",
                invalidInputMessage = "Please input a valid cc.json file!",
                inputValidator = InputValidator.isInputAnExistingFile("cc.json", "cc.json.gz"),
                onInputReady = fileCallback,
            )

            val selectedAction: String =
            myPromptList(
                    message = "Which action do you want to perform?",
                    choices =
                    listOf(
                            StructureModifierAction.PRINT_STRUCTURE.descripton,
                            StructureModifierAction.SET_ROOT.descripton,
                            StructureModifierAction.MOVE_NODES.descripton,
                            StructureModifierAction.REMOVE_NODES.descripton,
                    ),
                    onInputReady = actionCallback,
            )

            result =
            when (selectedAction) {
                StructureModifierAction.PRINT_STRUCTURE.descripton -> listOf(inputFileName, *collectPrintArguments(printCallback))
                StructureModifierAction.SET_ROOT.descripton -> listOf(inputFileName, *collectSetRootArguments(setRootCallback, outFileCallback))
                StructureModifierAction.MOVE_NODES.descripton -> listOf(inputFileName, *collectMoveNodesArguments(moveFromCallback, moveToCallback, outFileCallback))
                StructureModifierAction.REMOVE_NODES.descripton -> listOf(inputFileName, *collectRemoveNodesArguments(removeNodesCallback, outFileCallback))
                else -> listOf()
            }
            return result
        }
    }
}

private fun Session.collectPrintArguments(printCallback: suspend RunScope.() -> Unit): Array<String> {
    val printLevels: String =
    myPromptInputNumber(
        message = "How many print levels do you want to print?", hint = "0",
        onInputReady = printCallback,
    )
    return arrayOf("--print-levels=$printLevels")
}

private fun Session.collectSetRootArguments(
setRootCallback: suspend RunScope.() -> Unit,
outFileCallback: suspend RunScope.() -> Unit,
): Array<String> {
    val setRoot: String =
    myPromptInput(
        message = "What path within the project should be extracted as the new root?",
        onInputReady = setRootCallback,
        )
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf("--set-root=$setRoot", "--output-file=$outputFileName")
}

private fun Session.collectMoveNodesArguments(
moveFromCallback: suspend RunScope.() -> Unit,
moveToCallback: suspend RunScope.() -> Unit,
outFileCallback: suspend RunScope.() -> Unit,
): Array<String> {
    val moveFrom: String =
    myPromptInput(
        message = "What path should be moved (contained children will be moved as well)?",
        onInputReady = moveFromCallback,
    )
    val moveTo: String =
    myPromptInput(
        message = "What is the target path to move them?",
        onInputReady = moveToCallback,
    )
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf("--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
}

private fun Session.collectRemoveNodesArguments(
removeNodesCallback: suspend RunScope.() -> Unit,
outFileCallback: suspend RunScope.() -> Unit,
): Array<String> {
    val remove: String =
    myPromptInput(
        message = "What are the paths of the nodes to be removed?",
        onInputReady = removeNodesCallback,
    )
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf("--remove=$remove", "--output-file=$outputFileName")
}

private fun Session.collectOutputFileName(outFileCallback: suspend RunScope.() -> Unit): String {
    return myPromptInput(
        message = "What is the name of the output file?",
        onInputReady = outFileCallback,
    )
}
