package de.maibornwolff.codecharta.filter.edgefilter

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.InputType
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.Logger

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
            separatorCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val inputFileName: String = myPromptDefaultFileFolderInput(
                allowEmptyInput = false,
                inputType = de.maibornwolff.codecharta.tools.inquirer.InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = fileCallback
            )

            Logger.info {
                "File path: $inputFileName"
            }

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                onInputReady = outFileCallback
            )

            val defaultPathSeparator = "/"
            val pathSeparator: String = myPromptInput(
                message = "What is the path separator?",
                hint = defaultPathSeparator,
                invalidInputMessage = "Please specify a valid path separator like '/' or '\\'",
                onInputReady = separatorCallback
            )

            return listOf(inputFileName, "--output-file=$outputFileName", "--path-separator=$pathSeparator")
        }
    }
}
