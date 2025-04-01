package de.maibornwolff.codecharta.analysers.tools.inspection

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.ParserDialogInterface
import de.maibornwolff.codecharta.analysers.tools.inquirer.InputType
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.serialization.FileExtension

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = testCallback()
            )

            val levels = session.myPromptInputNumber(
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
