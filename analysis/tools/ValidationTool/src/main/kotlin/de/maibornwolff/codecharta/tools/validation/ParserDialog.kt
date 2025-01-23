package de.maibornwolff.codecharta.tools.validation

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(fileCallback: suspend RunScope.() -> Unit = {}): List<String> {
            print("Which file do you want to validate?")
            val inputFileName: String = myPromptDefaultFileFolderInput(
                allowEmptyInput = false,
                inputType = InputType.FILE,
                fileExtensionList = listOf(
                    FileExtension.CCJSON,
                    FileExtension.CCGZ
                ),
                onInputReady = fileCallback
            )

            return listOf(inputFileName)
        }
    }
}
