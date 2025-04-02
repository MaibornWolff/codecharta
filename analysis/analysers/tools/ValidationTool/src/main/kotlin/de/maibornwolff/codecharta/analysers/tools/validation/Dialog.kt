package de.maibornwolff.codecharta.analysers.tools.validation

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.serialization.FileExtension

class Dialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            print("Which file do you want to validate?")
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(
                    FileExtension.CCJSON,
                    FileExtension.CCGZ
                ),
                onInputReady = testCallback()
            )

            return listOf(inputFileName)
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
