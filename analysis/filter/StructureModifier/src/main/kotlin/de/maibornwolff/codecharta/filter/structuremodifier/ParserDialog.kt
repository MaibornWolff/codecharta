package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.math.BigDecimal
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var inputFileName: String
            do {
                inputFileName =
                    KInquirer.promptInput(
                        message = "What is the cc.json file that has to be modified?",
                        hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json"
                    )
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFileName)), canInputContainFolders = false))

            val selectedAction: String =
                KInquirer.promptList(
                    message = "Which action do you want to perform?",
                    choices =
                        listOf(
                            StructureModifierAction.PRINT_STRUCTURE.descripton,
                            StructureModifierAction.MIGRATE_MCC.descripton,
                            StructureModifierAction.SET_ROOT.descripton,
                            StructureModifierAction.MOVE_NODES.descripton,
                            StructureModifierAction.REMOVE_NODES.descripton
                        )
                )

            return when (selectedAction) {
                StructureModifierAction.PRINT_STRUCTURE.descripton -> listOf(inputFileName, *collectPrintArguments())
                StructureModifierAction.MIGRATE_MCC.descripton -> listOf(inputFileName, *collectMCCArguments())
                StructureModifierAction.SET_ROOT.descripton -> listOf(inputFileName, *collectSetRootArguments())
                StructureModifierAction.MOVE_NODES.descripton ->
                    listOf(
                        inputFileName,
                        *collectMoveNodesArguments()
                    )

                StructureModifierAction.REMOVE_NODES.descripton ->
                    listOf(
                        inputFileName,
                        *collectRemoveNodesArguments()
                    )

                else -> listOf()
            }
        }

        private fun collectPrintArguments(): Array<String> {
            val printLevels: BigDecimal =
                KInquirer.promptInputNumber(
                    message = "How many print levels do you want to print?",
                    default = "0",
                    hint = "0"
                )
            return arrayOf("--print-levels=$printLevels")
        }

        private fun collectMCCArguments(): Array<String> {
            val newName: String =
                KInquirer.promptList(
                    message = "This action will rename the mcc metric. Which should the new name be?",
                    choices = listOf("complexity", "sonar_complexity")
                )
            val renameParam = if (newName == "sonar_complexity") "--rename-mcc=sonar" else "--rename-mcc"
            val outputFileName = collectOutputFileName()
            return arrayOf(renameParam, "--output-file=$outputFileName")
        }

        private fun collectSetRootArguments(): Array<String> {
            val setRoot: String =
                KInquirer.promptInput(message = "What path within the project should be extracted as the new root?")
            val outputFileName = collectOutputFileName()
            return arrayOf("--set-root=$setRoot", "--output-file=$outputFileName")
        }

        private fun collectMoveNodesArguments(): Array<String> {
            val moveFrom: String =
                KInquirer.promptInput(
                    message = "What path should be moved (contained children will be moved as well)?"
                )
            val moveTo: String = KInquirer.promptInput(message = "What is the target path to move them?")
            val outputFileName = collectOutputFileName()
            return arrayOf("--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
        }

        private fun collectRemoveNodesArguments(): Array<String> {
            val remove: String = KInquirer.promptInput(message = "What are the paths of the nodes to be removed?")
            val outputFileName = collectOutputFileName()
            return arrayOf("--remove=$remove", "--output-file=$outputFileName")
        }

        private fun collectOutputFileName(): String {
            return KInquirer.promptInput(message = "What is the name of the output file?")
        }
    }
}
