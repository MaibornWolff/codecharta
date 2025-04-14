package de.maibornwolff.codecharta.analysers.importers.csv

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileNames: String = session.promptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CSV),
                multiple = true,
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val pathColumnName: String = session.promptInput(
                message = "What is the name of the path column name?",
                hint = "path",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )

            val delimiter: String = session.promptInput(
                message = "Which column delimiter is used in the CSV file?",
                hint = ",",
                onInputReady = testCallback()
            )

            val pathSeparator: String = session.promptInput(
                message = "Which path separator is used in the path names?",
                hint = "/",
                onInputReady = testCallback()
            )

            val isCompressed = outputFileName.isEmpty() || session.promptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            return inputFileNames.split(",").map { it.trim() } + listOfNotNull(
                "--output-file=$outputFileName",
                "--path-column-name=$pathColumnName",
                "--delimiter=$delimiter",
                "--path-separator=$pathSeparator",
                if (isCompressed) null else "--not-compressed"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
