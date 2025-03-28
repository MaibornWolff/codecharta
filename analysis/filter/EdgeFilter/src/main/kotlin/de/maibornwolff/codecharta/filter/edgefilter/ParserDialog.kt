package de.maibornwolff.codecharta.filter.edgefilter

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.tools.inquirer.InputType
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.analysers.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.Logger

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = testCallback()
            )

            Logger.info {
                "File path: $inputFileName"
            }

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val defaultPathSeparator = "/"
            val pathSeparator: String = session.myPromptInput(
                message = "What is the path separator?",
                hint = defaultPathSeparator,
                invalidInputMessage = "Please specify a valid path separator like '/' or '\\'",
                onInputReady = testCallback()
            )

            return listOf(inputFileName, "--output-file=$outputFileName", "--path-separator=$pathSeparator")
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
