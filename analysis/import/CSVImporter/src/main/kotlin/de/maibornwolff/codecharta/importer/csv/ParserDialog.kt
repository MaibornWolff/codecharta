package de.maibornwolff.codecharta.importer.csv

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CSV),
                onInputReady = fileCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback()
            )

            val pathColumnName: String = session.myPromptInput(
                message = "What is the name of the path column name?",
                hint = "path",
                allowEmptyInput = false,
                onInputReady = columnCallback()
            )

            val delimiter: String = session.myPromptInput(
                message = "Which column delimiter is used in the CSV file?",
                hint = ",",
                onInputReady = delimiterCallback()
            )

            val pathSeparator: String = session.myPromptInput(
                message = "Which path separator is used in the path names?",
                hint = "/",
                onInputReady = separatorCallback()
            )

            val isCompressed = outputFileName.isEmpty() || session.myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = compressCallback()
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

        internal fun fileCallback(): suspend RunScope.() -> Unit = {}

        internal fun outFileCallback(): suspend RunScope.() -> Unit = {}

        internal fun columnCallback(): suspend RunScope.() -> Unit = {}

        internal fun delimiterCallback(): suspend RunScope.() -> Unit = {}

        internal fun separatorCallback(): suspend RunScope.() -> Unit = {}

        internal fun compressCallback(): suspend RunScope.() -> Unit = {}
    }
}
