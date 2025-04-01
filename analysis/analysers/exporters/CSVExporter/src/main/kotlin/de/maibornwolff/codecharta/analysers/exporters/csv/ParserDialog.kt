package de.maibornwolff.codecharta.analysers.exporters.csv

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.analysers.inquirer.InputType
import de.maibornwolff.codecharta.analysers.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.analysers.inquirer.myPromptInput
import de.maibornwolff.codecharta.analysers.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.serialization.FileExtension

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val maxHierarchy: String =
                session.myPromptInputNumber(
                    message = "What is the maximum depth of hierarchy",
                    hint = "10",
                    onInputReady = testCallback()
                )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                "--depth-of-hierarchy=$maxHierarchy"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
