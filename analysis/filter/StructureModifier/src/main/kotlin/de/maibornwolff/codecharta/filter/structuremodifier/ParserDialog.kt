package de.maibornwolff.codecharta.filter.structuremodifier

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
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String =
                session.myPromptDefaultFileFolderInput(
                    inputType = InputType.FILE,
                    fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                    onInputReady = fileCallback()
                )

            val selectedAction: String =
                session.myPromptList(
                    message = "Which action do you want to perform?",
                    choices =
                        listOf(
                            StructureModifierAction.PRINT_STRUCTURE.descripton,
                            StructureModifierAction.MIGRATE_MCC.descripton,
                            StructureModifierAction.SET_ROOT.descripton,
                            StructureModifierAction.MOVE_NODES.descripton,
                            StructureModifierAction.REMOVE_NODES.descripton
                        ),
                    onInputReady = actionCallback()
                )

            return when (selectedAction) {
                StructureModifierAction.PRINT_STRUCTURE.descripton -> listOf(
                    inputFileName,
                    *collectPrintArguments(session)
                )
                StructureModifierAction.MIGRATE_MCC.descripton -> listOf(
                    inputFileName,
                    *collectMCCArguments(session)
                )
                StructureModifierAction.SET_ROOT.descripton -> listOf(
                    inputFileName,
                    *collectSetRootArguments(session)
                )
                StructureModifierAction.MOVE_NODES.descripton -> listOf(
                    inputFileName,
                    *collectMoveNodesArguments(session)
                )
                StructureModifierAction.REMOVE_NODES.descripton -> listOf(
                    inputFileName,
                    *collectRemoveNodesArguments(session)
                )
                else -> listOf()
            }
        }

        private fun collectPrintArguments(session: Session): Array<String> {
            val printLevels: String =
                session.myPromptInputNumber(
                    message = "How many print levels do you want to print?",
                    hint = "0",
                    onInputReady = printCallback()
                )
            return arrayOf("--print-levels=$printLevels")
        }

        private fun collectMCCArguments(session: Session): Array<String> {
            val newName: String =
                session.myPromptList(
                    message = "This action will rename the mcc metric. Which should the new name be?",
                    choices = listOf("complexity", "sonar_complexity"),
                    onInputReady = chooseNameCallback()
                )
            val renameParam = if (newName == "sonar_complexity") "--rename-mcc=sonar" else "--rename-mcc"
            val outputFileName = collectOutputFileName(session)
            return arrayOf(renameParam, "--output-file=$outputFileName")
        }

        private fun collectSetRootArguments(session: Session): Array<String> {
            val setRoot: String =
                session.myPromptInput(
                    message = "What path within the project should be extracted as the new root?",
                    onInputReady = setRootCallback()
                )
            val outputFileName = collectOutputFileName(session)
            return arrayOf("--set-root=$setRoot", "--output-file=$outputFileName")
        }

        private fun collectMoveNodesArguments(session: Session): Array<String> {
            val moveFrom: String =
                session.myPromptInput(
                    message = "What path should be moved (contained children will be moved as well)?",
                    onInputReady = moveFromCallback()
                )
            val moveTo: String =
                session.myPromptInput(
                    message = "What is the target path to move them?",
                    onInputReady = moveToCallback()
                )
            val outputFileName = collectOutputFileName(session)
            return arrayOf("--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
        }

        private fun collectRemoveNodesArguments(session: Session): Array<String> {
            val remove: String =
                session.myPromptInput(
                    message = "What are the paths of the nodes to be removed?",
                    onInputReady = removeNodesCallback()
                )
            val outputFileName = collectOutputFileName(session)
            return arrayOf("--remove=$remove", "--output-file=$outputFileName")
        }

        private fun collectOutputFileName(session: Session): String {
            return session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback()
            )
        }

        internal fun fileCallback(): suspend RunScope.() -> Unit = {}

        internal fun actionCallback(): suspend RunScope.() -> Unit = {}

        internal fun printCallback(): suspend RunScope.() -> Unit = {}

        internal fun setRootCallback(): suspend RunScope.() -> Unit = {}

        internal fun moveFromCallback(): suspend RunScope.() -> Unit = {}

        internal fun moveToCallback(): suspend RunScope.() -> Unit = {}

        internal fun removeNodesCallback(): suspend RunScope.() -> Unit = {}

        internal fun chooseNameCallback(): suspend RunScope.() -> Unit = {}

        internal fun outFileCallback(): suspend RunScope.() -> Unit = {}
    }
}
