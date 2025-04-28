package de.maibornwolff.codecharta.analysers.tools.validation

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInputComplete
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            print("Which file do you want to validate?")
            val inputFileName: String = session.promptInputComplete(
                message = "Validate file",
                hint = "someInput",
                allowEmptyInput = false,
                invalidInputMessage = "Input Invalid",
                onInputReady = testCallback()
            )


//                session.promptDefaultFileFolderInput(
//                inputType = InputType.FILE,
//                fileExtensionList = listOf(
//                    FileExtension.CCJSON,
//                    FileExtension.CCGZ
//                ),
//                onInputReady = testCallback()
//            )

            return listOf(inputFileName)
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
