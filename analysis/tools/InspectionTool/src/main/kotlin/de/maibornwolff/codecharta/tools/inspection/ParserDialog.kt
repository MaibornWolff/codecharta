package de.maibornwolff.codecharta.tools.inspection

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                onInputReady = fileCallback()
            )

            val levels = session.myPromptInputNumber(
                message = "How many levels do you want to print?",
                hint = "0",
                allowEmptyInput = false,
                onInputReady = levelsCallback()
            )

            return listOf(inputFileName, "--levels=$levels")
        }

        internal fun fileCallback(): suspend RunScope.() -> Unit = {}

        internal fun levelsCallback(): suspend RunScope.() -> Unit = {}
    }
}
