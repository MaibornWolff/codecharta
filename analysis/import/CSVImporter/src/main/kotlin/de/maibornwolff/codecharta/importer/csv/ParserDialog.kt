package de.maibornwolff.codecharta.importer.csv

import com.varabyte.kotter.foundation.session
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
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            fileCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            columnCallback: suspend RunScope.() -> Unit = {},
            delimiterCallback: suspend RunScope.() -> Unit = {},
            separatorCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val inputFileName: String = myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CSV),
                onInputReady = fileCallback
            )

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val pathColumnName: String = myPromptInput(
                message = "What is the name of the path column name?",
                hint = "path",
                allowEmptyInput = false,
                onInputReady = columnCallback
            )

            val delimiter: String = myPromptInput(
                message = "Which column delimiter is used in the CSV file?",
                hint = ",",
                onInputReady = delimiterCallback
            )

            val pathSeparator: String = myPromptInput(
                message = "Which path separator is used in the path names?",
                hint = "/",
                onInputReady = separatorCallback
            )

            val isCompressed = outputFileName.isEmpty() || myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = compressCallback
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
    }
}
