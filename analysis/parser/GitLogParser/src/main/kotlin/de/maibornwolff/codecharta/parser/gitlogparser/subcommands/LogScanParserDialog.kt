package de.maibornwolff.codecharta.parser.gitlogparser.subcommands

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.InputValidator
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class LogScanParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            val gitLogFile = session.myPromptInput(
                message = "What is the git.log file that has to be parsed?",
                hint = "git.log",
                allowEmptyInput = false,
                inputValidator = InputValidator.isInputAnExistingFile(),
                onInputReady = testCallback()
            )

            print("You can generate this file with: git ls-files > file-name-list.txt")
            val gitLsFile = session.myPromptInput(
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
