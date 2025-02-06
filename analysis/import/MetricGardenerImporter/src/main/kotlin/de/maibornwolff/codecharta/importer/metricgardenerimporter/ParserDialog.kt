package de.maibornwolff.codecharta.importer.metricgardenerimporter

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
            jsonCallback: suspend RunScope.() -> Unit = {},
            fileCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val isJsonFile: Boolean = myPromptConfirm(
                message = "Do you already have a MetricGardener json-File?",
                onInputReady = jsonCallback
            )

            val inputFileName: String = if (isJsonFile) {
                myPromptDefaultFileFolderInput(
                    allowEmptyInput = false,
                    InputType.FILE,
                    listOf(FileExtension.JSON),
                    onInputReady = fileCallback
                )
            } else {
                myPromptDefaultFileFolderInput(allowEmptyInput = false, InputType.FOLDER, listOf(), onInputReady = fileCallback)
            }

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val isCompressed = outputFileName.isEmpty() || myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = compressCallback
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                if (isJsonFile) "--is-json-file" else null
            )
        }
    }
}
