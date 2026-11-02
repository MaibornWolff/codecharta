package de.maibornwolff.codecharta.analysers.tools.analyse

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges.CommitChangesScan
import de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership.AuthorOwnershipScan
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val projectFolder = session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FOLDER,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )
            val outputFile = session.promptInput(
                message = "What is the name of the output file?",
                hint = "leave empty for <folder name>.cc.json.gz in the current folder",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            val exclude = session.promptInput(
                message = "Do you want to exclude files or folders by regex pattern?",
                hint = "regex1, regex2.. (leave empty to exclude nothing)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            val authorOwnership = session.promptConfirm(
                message = "Add author ownership under invented names? Anyone with the repository can match the invented names to people.",
                initialChoice = false,
                onInputReady = testCallback()
            )
            val withAuthorNames = authorOwnership &&
                session.promptConfirm(
                    message = "Write REAL author names into the map instead of invented ones? Anyone who gets the map can read them.",
                    initialChoice = false,
                    onInputReady = testCallback()
                )
            val commitChangesSince = session
                .promptInput(
                    message = CommitChangesScan.DIALOG_QUESTION,
                    hint = CommitChangesScan.DIALOG_HINT,
                    allowEmptyInput = true,
                    invalidInputMessage = CommitChangesScan.DIALOG_INVALID_DATE,
                    inputValidator = CommitChangesScan::isDate,
                    onInputReady = testCallback()
                ).trim()
            return listOfNotNull(
                projectFolder,
                outputFile.ifBlank { null }?.let { "--output-file=$it" },
                exclude.ifBlank { null }?.let { "--exclude=$it" },
                AuthorOwnershipScan.FLAG.takeIf { authorOwnership },
                AuthorOwnershipScan.NAMES_FLAG.takeIf { withAuthorNames },
                commitChangesSince.ifEmpty { null }?.let { "${CommitChangesScan.FLAG}=$it" }
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
