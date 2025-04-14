package de.maibornwolff.codecharta.analysers.exporters.csv

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileNames: String = session.promptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                multiple = true,
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val maxHierarchy: String =
                session.promptInputNumber(
                    message = "What is the maximum depth of hierarchy",
                    hint = "10",
                    onInputReady = testCallback()
                )

            return inputFileNames.split(",").map { it.trim() } + listOfNotNull(
                "--output-file=$outputFileName",
                "--depth-of-hierarchy=$maxHierarchy"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
