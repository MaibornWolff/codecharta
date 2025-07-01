package de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.displayInfo
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput

class LogScanDialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            session.displayInfo("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            val gitLogFile = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(),
                multiple = false,
                postMessageText = " (Git Log)",
                onInputReady = testCallback()
            )

            session.displayInfo("You can generate this file with: git ls-files > file-name-list.txt")
            val gitLsFile = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FILE,
                fileExtensionList = listOf(),
                multiple = false,
                postMessageText = " (File Name List)",
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
