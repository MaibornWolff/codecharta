package de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputValidator
import de.maibornwolff.codecharta.dialogProvider.promptInput

class LogScanDialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            val gitLogFile = session.promptInput(
                message = "What is the git.log file that has to be parsed?",
                hint = "git.log",
                allowEmptyInput = false,
                inputValidator = InputValidator.isInputAnExistingFile(),
                onInputReady = testCallback()
            )

            print("You can generate this file with: git ls-files > file-name-list.txt")
            val gitLsFile = session.promptInput(
                message = "What is the path to the file name list?",
                hint = "file-name-list.txt",
                allowEmptyInput = false,
                inputValidator = InputValidator.isInputAnExistingFile(),
                onInputReady = testCallback()
            )

            return listOf(
                "--git-log=$gitLogFile",
                "--repo-files=$gitLsFile"
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
