package de.maibornwolff.codecharta.filter.structuremodifier

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            fileCallback: suspend RunScope.() -> Unit = {},
            actionCallback: suspend RunScope.() -> Unit = {},
            printCallback: suspend RunScope.() -> Unit = {},
            setRootCallback: suspend RunScope.() -> Unit = {},
            moveFromCallback: suspend RunScope.() -> Unit = {},
            moveToCallback: suspend RunScope.() -> Unit = {},
            removeNodesCallback: suspend RunScope.() -> Unit = {},
            chooseNameCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val result: List<String>

            val inputFileName: String =
                myPromptDefaultFileFolderInput(
                    inputType = InputType.FILE,
                    fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                    onInputReady = fileCallback
                )

            val selectedAction: String =
                myPromptList(
                    message = "Which action do you want to perform?",
                    choices =
                        listOf(
                            StructureModifierAction.PRINT_STRUCTURE.descripton,
                            StructureModifierAction.MIGRATE_MCC.descripton,
                            StructureModifierAction.SET_ROOT.descripton,
                            StructureModifierAction.MOVE_NODES.descripton,
                            StructureModifierAction.REMOVE_NODES.descripton
                        ),
                    onInputReady = actionCallback
                )

            result =
                when (selectedAction) {
                    StructureModifierAction.PRINT_STRUCTURE.descripton -> listOf(
                        inputFileName, *collectPrintArguments(printCallback)
                    )
                    StructureModifierAction.MIGRATE_MCC.descripton -> listOf(
                        inputFileName, *collectMCCArguments(chooseNameCallback, outFileCallback)
                    )
                    StructureModifierAction.SET_ROOT.descripton -> listOf(
                        inputFileName, *collectSetRootArguments(setRootCallback, outFileCallback)
                    )
                    StructureModifierAction.MOVE_NODES.descripton -> listOf(
                        inputFileName, *collectMoveNodesArguments(moveFromCallback, moveToCallback, outFileCallback)
                    )
                    StructureModifierAction.REMOVE_NODES.descripton -> listOf(
                        inputFileName, *collectRemoveNodesArguments(removeNodesCallback, outFileCallback)
                    )
                    else -> listOf()
                }
            return result
        }
    }
}

private fun Session.collectPrintArguments(printCallback: suspend RunScope.() -> Unit): Array<String> {
    val printLevels: String =
        myPromptInputNumber(
            message = "How many print levels do you want to print?",
            hint = "0",
            onInputReady = printCallback
        )
    return arrayOf("--print-levels=$printLevels")
}

private fun Session.collectMCCArguments(
    chooseNameCallback: suspend RunScope.() -> Unit,
    outFileCallback: suspend RunScope.() -> Unit
): Array<String> {
    val newName: String =
        myPromptList(
            message = "This action will rename the mcc metric. Which should the new name be?",
            choices = listOf("complexity", "sonar_complexity"),
            onInputReady = chooseNameCallback
        )
    val renameParam = if (newName == "sonar_complexity") "--rename-mcc=sonar" else "--rename-mcc"
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf(renameParam, "--output-file=$outputFileName")
}

private fun Session.collectSetRootArguments(
    setRootCallback: suspend RunScope.() -> Unit,
    outFileCallback: suspend RunScope.() -> Unit
): Array<String> {
    val setRoot: String =
        myPromptInput(
            message = "What path within the project should be extracted as the new root?",
            onInputReady = setRootCallback
        )
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf("--set-root=$setRoot", "--output-file=$outputFileName")
}

private fun Session.collectMoveNodesArguments(
    moveFromCallback: suspend RunScope.() -> Unit,
    moveToCallback: suspend RunScope.() -> Unit,
    outFileCallback: suspend RunScope.() -> Unit
): Array<String> {
    val moveFrom: String =
        myPromptInput(
            message = "What path should be moved (contained children will be moved as well)?",
            onInputReady = moveFromCallback
        )
    val moveTo: String =
        myPromptInput(
            message = "What is the target path to move them?",
            onInputReady = moveToCallback
        )
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf("--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
}

private fun Session.collectRemoveNodesArguments(
    removeNodesCallback: suspend RunScope.() -> Unit,
    outFileCallback: suspend RunScope.() -> Unit
): Array<String> {
    val remove: String =
        myPromptInput(
            message = "What are the paths of the nodes to be removed?",
            onInputReady = removeNodesCallback
        )
    val outputFileName = collectOutputFileName(outFileCallback)
    return arrayOf("--remove=$remove", "--output-file=$outputFileName")
}

private fun Session.collectOutputFileName(outFileCallback: suspend RunScope.() -> Unit): String {
    return myPromptInput(
        message = "What is the name of the output file?",
        onInputReady = outFileCallback
    )
}
