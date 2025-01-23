package de.maibornwolff.codecharta.parser.svnlogparser

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            fileCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {},
            silentCallback: suspend RunScope.() -> Unit = {},
            authorCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            print("You can generate this file with: svn log --verbose > svn.log")
            val inputFileName: String = myPromptDefaultFileFolderInput(
                allowEmptyInput = false,
                inputType = InputType.FILE,
                fileExtensionList = listOf(),
                onInputReady = fileCallback
            )

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    myPromptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = compressCallback
                    )

            val isSilent: Boolean = myPromptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = silentCallback
            )

            val addAuthor: Boolean = myPromptConfirm(
                message = "Do you want to add authors to every file?",
                onInputReady = authorCallback
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
