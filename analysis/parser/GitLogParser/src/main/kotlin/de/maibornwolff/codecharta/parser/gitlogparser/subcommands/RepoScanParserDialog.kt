package de.maibornwolff.codecharta.parser.gitlogparser.subcommands

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class RepoScanParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var repoPath: String
            do {
                repoPath = collectRepoPath()
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(repoPath)), canInputContainFolders = true))

            return listOfNotNull(
                if (repoPath.isBlank()) null else "--repo-path=$repoPath"
            )
        }

        private fun collectRepoPath(): String {
            return KInquirer.promptInput(
                message = "What is the root directory of the git project you want to parse?",
                default = Paths.get("").normalize().toAbsolutePath().toString()
            )
        }
    }
}
