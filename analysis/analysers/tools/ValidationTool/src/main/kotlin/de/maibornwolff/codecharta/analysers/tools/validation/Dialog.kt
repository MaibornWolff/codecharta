package de.maibornwolff.codecharta.analysers.tools.validation

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.displayInfo
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            session.displayInfo("Validate whether a file is CodeCharta conform")
            val inputFileName: String = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                multiple = false,
                onInputReady = testCallback()
            )

            return listOf(inputFileName)
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
