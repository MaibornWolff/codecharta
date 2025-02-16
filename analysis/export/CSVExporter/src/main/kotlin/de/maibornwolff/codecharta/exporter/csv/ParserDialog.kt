package de.maibornwolff.codecharta.exporter.csv

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = de.maibornwolff.codecharta.tools.inquirer.InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = fileCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback()
            )

            val maxHierarchy: String =
                session.myPromptInputNumber(
                    message = "What is the maximum depth of hierarchy",
                    hint = "10",
                    onInputReady = hierarchyCallback()
                )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--depth-of-hierarchy=$maxHierarchy"
            )
        }

        internal fun fileCallback(): suspend RunScope.() -> Unit = {}

        internal fun outFileCallback(): suspend RunScope.() -> Unit = {}

        internal fun hierarchyCallback(): suspend RunScope.() -> Unit = {}
    }
}
