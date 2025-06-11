package de.maibornwolff.codecharta.analysers.tools.inspection

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName: String = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = testCallback()
            )

            val levels = session.promptInputNumber(
                message = "How many levels do you want to print?",
                hint = "0",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )

            return listOf(inputFileName, "--levels=$levels")
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
