package de.maibornwolff.codecharta.analysers.parsers.gitlog

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.InputValidator
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
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

            val commitRef = commitQuestion(session)
            val authorOwnership = session.promptConfirm(
                message = "Add numbered author ownership? Anyone with the repository can match the numbers to people.",
                initialChoice = false,
                onInputReady = testCallback()
            )

            return listOfNotNull(
                "--repo-path=$repoPath",
                if (commitRef.isNotEmpty()) "--commit=$commitRef" else null,
                RepoScanCommand.AUTHOR_OWNERSHIP_FLAG.takeIf { authorOwnership }
            )
        }

        private fun commitQuestion(session: Session): String = session
            .promptInput(
                message = "Analyze a specific commit? (leave empty for current state)",
                hint = "e.g. HEAD~5, abc1234, v2.0.0",
                allowEmptyInput = true,
                onInputReady = testCallback()
            ).trim()

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
