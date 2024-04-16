package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File

class LogScanParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            var gitLogFile: String
            do {
                gitLogFile = getInputFileName("What is the git.log file that has to be parsed?", "git.log")
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(gitLogFile)), canInputContainFolders = false))

            print("You can generate this file with: git ls-files > file-name-list.txt")
            var gitLsFile: String
            do {
                gitLsFile = getInputFileName("What is the path to the file name list?", "file-name-list.txt")
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(gitLsFile)), canInputContainFolders = false))

            return listOfNotNull(
                "--git-log=$gitLogFile",
                "--repo-files=$gitLsFile"
            )
        }
    }
}
