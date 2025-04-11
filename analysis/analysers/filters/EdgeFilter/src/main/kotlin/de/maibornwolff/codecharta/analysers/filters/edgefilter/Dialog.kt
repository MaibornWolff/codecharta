package de.maibornwolff.codecharta.analysers.filters.edgefilter

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.Logger

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName: String = session.promptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = testCallback()
            )

            Logger.info {
                "File path: $inputFileName"
            }

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val defaultPathSeparator = "/"
            val pathSeparator: String = session.promptInput(
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
