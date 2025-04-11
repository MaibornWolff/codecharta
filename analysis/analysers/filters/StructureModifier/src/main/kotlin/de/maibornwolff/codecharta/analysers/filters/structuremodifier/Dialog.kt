package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber
import de.maibornwolff.codecharta.dialogProvider.promptList
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName: String =
                session.promptDefaultFileFolderInput(
                    inputType = InputType.FILE,
                    fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                    onInputReady = testCallback()
                )

            val selectedAction: String =
                session.promptList(
                    message = "Which action do you want to perform?",
                    choices =
                        listOf(
                            StructureModifierAction.PRINT_STRUCTURE.descripton,
                            StructureModifierAction.MIGRATE_MCC.descripton,
                            StructureModifierAction.SET_ROOT.descripton,
                            StructureModifierAction.MOVE_NODES.descripton,
                            StructureModifierAction.REMOVE_NODES.descripton
                        ),
                    onInputReady = testCallback()
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
                session.promptInputNumber(
                    message = "How many print levels do you want to print?",
                    hint = "0",
                    onInputReady = testCallback()
                )
            return arrayOf("--print-levels=$printLevels")
        }

        private fun collectMCCArguments(session: Session): Array<String> {
            val newName: String =
                session.promptList(
                    message = "This action will rename the mcc metric. Which should the new name be?",
                    choices = listOf("complexity", "sonar_complexity"),
                    onInputReady = testCallback()
                )
            val renameParam = if (newName == "sonar_complexity") "--rename-mcc=sonar" else "--rename-mcc"
            val outputFileName = collectOutputFileName(session)
            return arrayOf(renameParam, "--output-file=$outputFileName")
        }

        private fun collectSetRootArguments(session: Session): Array<String> {
            val setRoot: String =
                session.promptInput(
                    message = "What path within the project should be extracted as the new root?",
                    onInputReady = testCallback()
                )
            val outputFileName = collectOutputFileName(session)
            return arrayOf("--set-root=$setRoot", "--output-file=$outputFileName")
        }

        private fun collectMoveNodesArguments(session: Session): Array<String> {
            val moveFrom: String =
                session.promptInput(
                    message = "What path should be moved (contained children will be moved as well)?",
                    onInputReady = testCallback()
                )
            val moveTo: String =
                session.promptInput(
                    message = "What is the target path to move them?",
                    onInputReady = testCallback()
                )
            val outputFileName = collectOutputFileName(session)
            return arrayOf("--move-from=$moveFrom", "--move-to=$moveTo", "--output-file=$outputFileName")
        }

        private fun collectRemoveNodesArguments(session: Session): Array<String> {
            val remove: String =
                session.promptInput(
                    message = "What are the paths of the nodes to be removed?",
                    onInputReady = testCallback()
                )
            val outputFileName = collectOutputFileName(session)
            return arrayOf("--remove=$remove", "--output-file=$outputFileName")
        }

        private fun collectOutputFileName(session: Session): String {
            return session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
