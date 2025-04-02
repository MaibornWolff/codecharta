package de.maibornwolff.codecharta.parser.gitlogparser.subcommands

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.InputValidator
import de.maibornwolff.codecharta.dialogProvider.myPromptInput
import java.nio.file.Paths

class RepoScanDialog {
    companion object : AnalyserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val repoPath = session.myPromptInput(
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
