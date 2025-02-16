package de.maibornwolff.codecharta.parser.svnlogparser

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            println("You can generate this file with: svn log --verbose > svn.log")
            val inputFileName: String = session.myPromptDefaultFileFolderInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(),
                onInputReady = fileCallback()
            )

            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback()
            )

            val isCompressed =
                (outputFileName.isEmpty()) ||
                    session.myPromptConfirm(
                        message = "Do you want to compress the output file?",
                        onInputReady = compressCallback()
                    )

            val isSilent: Boolean = session.myPromptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = silentCallback()
            )

            val addAuthor: Boolean = session.myPromptConfirm(
                message = "Do you want to add authors to every file?",
                onInputReady = authorCallback()
            )

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }

        internal fun fileCallback(): suspend RunScope.() -> Unit = {}

        internal fun outFileCallback(): suspend RunScope.() -> Unit = {}

        internal fun compressCallback(): suspend RunScope.() -> Unit = {}

        internal fun silentCallback(): suspend RunScope.() -> Unit = {}

        internal fun authorCallback(): suspend RunScope.() -> Unit = {}
    }
}
