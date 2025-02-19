package de.maibornwolff.codecharta.parser.gitlogparser

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.LogScanCommand
import de.maibornwolff.codecharta.parser.gitlogparser.subcommands.RepoScanCommand
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val isLogScan = collectSubcommand(session)
            val subcommand = if (isLogScan) {
                "log-scan"
            } else {
                "repo-scan"
            }

            val subcommandArgs: List<String> = if (isLogScan) {
                LogScanCommand().getDialog().collectParserArgs(session)
            } else {
                RepoScanCommand().getDialog().collectParserArgs(session)
            }

            val generalArgs = collectGeneralArgs(session)

            return listOf(subcommand) + generalArgs + (subcommandArgs)
        }

        internal fun collectSubcommand(session: Session): Boolean {
            return session.myPromptConfirm(
                message = "Do you already have a git.log and git ls file?",
                onInputReady = testCallback()
            )
        }

        internal fun collectGeneralArgs(session: Session): List<String> {
            val outputFileName: String = session.myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed = (outputFileName.isEmpty()) || session.myPromptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            val isSilent: Boolean = session.myPromptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )

            val addAuthor: Boolean = session.myPromptConfirm(
                message = "Do you want to add authors to every file?",
                onInputReady = testCallback()
            )

            return listOfNotNull(
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
