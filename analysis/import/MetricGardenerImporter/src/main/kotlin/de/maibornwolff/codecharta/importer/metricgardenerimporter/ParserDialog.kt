package de.maibornwolff.codecharta.importer.metricgardenerimporter

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
            val isJsonFile: Boolean = session.myPromptConfirm(
                message = "Do you already have a MetricGardener json-File?",
                onInputReady = testCallback()
            )

            val inputFileName: String = if (isJsonFile) {
                session.myPromptDefaultFileFolderInput(
                    InputType.FILE,
                    listOf(FileExtension.JSON),
                    onInputReady = testCallback()
                )
            } else {
                session.myPromptDefaultFileFolderInput(InputType.FOLDER, listOf(), onInputReady = testCallback())
            }

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed = outputFileName.isEmpty() || session.myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                if (isJsonFile) "--is-json-file" else null
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
