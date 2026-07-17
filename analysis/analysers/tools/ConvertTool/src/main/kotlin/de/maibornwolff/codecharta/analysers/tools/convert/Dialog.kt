package de.maibornwolff.codecharta.analysers.tools.convert

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName: String = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = testCallback()
            )

            val outputFileName = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            return listOfNotNull(inputFileName, outputFileName.takeIf { it.isNotEmpty() }?.let { "--output-file=$it" })
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
