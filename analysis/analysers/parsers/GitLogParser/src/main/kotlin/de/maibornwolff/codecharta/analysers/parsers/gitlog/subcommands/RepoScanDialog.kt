package de.maibornwolff.codecharta.analysers.parsers.gitlog.subcommands

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.InputValidator
import de.maibornwolff.codecharta.dialogProvider.promptInput
import java.nio.file.Paths

class RepoScanDialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val repoPath = session.promptInput(
                message = "What is the root directory of the git project you want to parse?",
                hint = Paths.get("").normalize().toAbsolutePath().toString(),
                allowEmptyInput = false,
                inputValidator = InputValidator.isFileOrFolderValid(
                    InputType.FOLDER,
                    listOf()
                ),
                onInputReady = testCallback()
            )
            return listOf("--repo-path=$repoPath")
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
