package de.maibornwolff.codecharta.parser.gitlogparser

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.LogScanCommand
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.RepoScanCommand
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            var isLogScan = false
            session {
                isLogScan = collectSubcommand()
            }
            val subcommand = if (isLogScan) {
                "log-scan"
            } else {
                "repo-scan"
            }

            val subcommandArgs: List<String> = if (isLogScan) {
                LogScanCommand().getDialog().collectParserArgs()
            } else {
                RepoScanCommand().getDialog().collectParserArgs()
            }
            session {
                res = listOf(subcommand) + myCollectParserArgs() + (subcommandArgs)
            }

            return res
        }

        internal fun Session.collectSubcommand(scanCallback: suspend RunScope.() -> Unit = {}): Boolean {
            return myPromptConfirm(
                message = "Do you already have a git.log and git ls file?",
                onInputReady = scanCallback
            )
        }

        internal fun Session.myCollectParserArgs(
            outFileCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {},
            silentCallback: suspend RunScope.() -> Unit = {},
            authorCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val isCompressed = (outputFileName.isEmpty()) || myPromptConfirm(
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
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
