package de.maibornwolff.codecharta.analysis.importer.csv

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.myPromptConfirm
import de.maibornwolff.codecharta.dialogProvider.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.myPromptInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CSV),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val pathColumnName: String = session.myPromptInput(
                message = "What is the name of the path column name?",
                hint = "path",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )

            val delimiter: String = session.myPromptInput(
                message = "Which column delimiter is used in the CSV file?",
                hint = ",",
                onInputReady = testCallback()
            )

            val pathSeparator: String = session.myPromptInput(
                message = "Which path separator is used in the path names?",
                hint = "/",
                onInputReady = testCallback()
            )

            val isCompressed = outputFileName.isEmpty() || session.myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
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
