package de.maibornwolff.codecharta.parser.gitlogparser.subcommands

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.nio.file.Paths

class RepoScanParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val repoPath = session.myPromptInput(
                message = "What is the root directory of the git project you want to parse?",
                hint = Paths.get("").normalize().toAbsolutePath().toString(),
                allowEmptyInput = false,
                inputValidator = InputValidator.isFileOrFolderValid(InputType.FOLDER, listOf()),
                onInputReady = repoCallback()
            )
            return listOf("--repo-path=$repoPath")
        }

        internal fun repoCallback(): suspend RunScope.() -> Unit = {}
    }
}
