package de.maibornwolff.codecharta.filter.edgefilter

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.Logger

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = fileCallback()
            )

            Logger.info {
                "File path: $inputFileName"
            }

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback()
            )

            val defaultPathSeparator = "/"
            val pathSeparator: String = session.myPromptInput(
                message = "What is the path separator?",
                hint = defaultPathSeparator,
                invalidInputMessage = "Please specify a valid path separator like '/' or '\\'",
                onInputReady = separatorCallback()
            )

            return listOf(inputFileName, "--output-file=$outputFileName", "--path-separator=$pathSeparator")
        }

        internal fun fileCallback(): suspend RunScope.() -> Unit = {}

        internal fun outFileCallback(): suspend RunScope.() -> Unit = {}

        internal fun separatorCallback(): suspend RunScope.() -> Unit = {}
    }
}
