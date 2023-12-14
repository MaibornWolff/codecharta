package de.maibornwolff.codecharta.filter.structuremodifier

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.io.File
import java.math.BigDecimal
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val inputFolderName =
                    KInquirer.promptInput(
                            message = "What is the cc.json file that has to be modified?",
                            hint = Paths.get("").toAbsolutePath().toString() + File.separator + "yourInput.cc.json")

            val selectedAction: String = KInquirer.promptList(
                    message = "Which action do you want to perform?",
                    choices = listOf(
                            StructureModifierAction.PRINT_STRUCTURE.descripton,
                            StructureModifierAction.EXTRACT_PATH.descripton,
                            StructureModifierAction.MOVE_NODES.descripton,
                            StructureModifierAction.REMOVE_NODES.descripton
                    )
            )

            return when (selectedAction) {
                StructureModifierAction.PRINT_STRUCTURE.descripton -> collectPrintArguments(inputFolderName)
                StructureModifierAction.EXTRACT_PATH.descripton -> collectExtractPathArguments(inputFolderName)
                StructureModifierAction.MOVE_NODES.descripton -> collectMoveNodesArguments(inputFolderName)
                StructureModifierAction.REMOVE_NODES.descripton -> collectRemoveNodesArguments(inputFolderName)
                else -> listOf()
            }
        }

        private fun collectPrintArguments(inputFolderName: String): List<String> {
            val printLevels: BigDecimal =
                    KInquirer.promptInputNumber(message = "How many print levels do you want to print? (Optional)", default = "0", hint = "0")
            return listOf(inputFolderName, "--print-levels=$printLevels")
        }

        private fun collectExtractPathArguments(inputFolderName: String): List<String> {
            val setRoot: String =
                    KInquirer.promptInput(message = "What path within project to be extracted?")
            val outputFileName = collectOutputFileName()
            return listOf(inputFolderName, "--set-root=$setRoot", "--output-file=$outputFileName")
        }

        private fun collectMoveNodesArguments(inputFolderName: String): List<String> {
            val moveFrom: String =
                    KInquirer.promptInput(message = "What are the nodes to be moved?")
            val moveTo: String =
                    KInquirer.promptInput(message = "Where to move them?")
            val outputFileName = collectOutputFileName()
            return listOf(inputFolderName, "--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
        }

        private fun collectRemoveNodesArguments(inputFolderName: String): List<String> {
            val remove: String =
                    KInquirer.promptInput(message = "What are the nodes to be removed?")
            val outputFileName = collectOutputFileName()
            return listOf(inputFolderName, "--remove=$remove", "--output-file=$outputFileName")
        }

        private fun collectOutputFileName(): String {
            return KInquirer.promptInput(message = "What is the name of the output file?")
        }
    }
}
