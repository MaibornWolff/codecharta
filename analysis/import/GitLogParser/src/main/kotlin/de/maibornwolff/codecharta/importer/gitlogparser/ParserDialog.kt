package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "log"


        override fun collectParserArgs(): List<String> {
            val isLogScan = KInquirer.promptConfirm(
                message = "Do you already have a git.log and git ls file?",
                default = true
            )

            if (isLogScan) {
                return listOfNotNull(
                    "log-scan",
                    LogScanParserDialog.collectParserArgs().toString()
                )
            } else {
                return listOfNotNull(
                    "repo-scan",
                    RepoScanParserDialog.collectParserArgs().toString()
                )
            }
        }
    }


}
