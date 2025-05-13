package de.maibornwolff.codecharta.analysers.parsers.unified

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName = session.promptDefaultFileFolderInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    session.promptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = testCallback()
                    )

            val verbose: Boolean = session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=$verbose",
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
