package de.maibornwolff.codecharta.analysers.parsers.gitlog

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands.LogScanCommand
import de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands.RepoScanCommand
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptInput

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val isLogScan = collectSubcommand(session)
            val subcommand = if (isLogScan) {
                "log-scan"
            } else {
                "repo-scan"
            }

            val generalArgs = collectGeneralArgs(session)

            val subcommandArgs: List<String> = if (isLogScan) {
                LogScanCommand().getDialog().collectAnalyserArgs(session)
            } else {
                RepoScanCommand().getDialog().collectAnalyserArgs(session)
            }

            return listOf(subcommand) + generalArgs + subcommandArgs
        }

        internal fun collectSubcommand(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you already have a git.log and git ls file?",
                onInputReady = testCallback()
            )
        }

        internal fun collectGeneralArgs(session: Session): List<String> {
            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed = (outputFileName.isEmpty()) || session.promptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )

            val isSilent: Boolean = session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )

            val addAuthor: Boolean = session.promptConfirm(
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
