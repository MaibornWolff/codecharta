package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class LogScanParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {

            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            var gitLogFile = collectGitLogFile()
            while (!InputHelper.isInputValidAndNotNull(arrayOf(File(gitLogFile)), canInputContainFolders = false)) {
                gitLogFile = collectGitLogFile()
            }

            print("You can generate this file with: git ls-files > file-name-list.txt")
            var gitLsFile = collectGitLsFile()
            while (!InputHelper.isInputValidAndNotNull(arrayOf(File(gitLsFile)), canInputContainFolders = false)) {
                gitLsFile = collectGitLsFile()
            }

            return listOfNotNull(
                "--git-log=$gitLogFile",
                "--repo-files=$gitLsFile"
            )
        }

        private fun collectGitLogFile(): String {
            return KInquirer.promptInput(
                    message = "What is the git.log file that has to be parsed?",
                    hint = Paths.get("").toAbsolutePath().toString() + File.separator + "git.log"
            )
        }

        private fun collectGitLsFile(): String {
            return KInquirer.promptInput(
                    message = "What is the path to the file name list?",
                    hint = Paths.get("").toAbsolutePath().toString() + File.separator + "file-name-list.txt"
            )
        }
    }
}
