package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.LogScanParserDialog
import de.maibornwolff.codecharta.importer.gitlogparser.subcommands.RepoScanParserDialog
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val isLogScan = KInquirer.promptConfirm(
                message = "Do you already have a git.log and git ls file?",
                default = true
            )

            val subcommand: String =
                if (isLogScan) {
                    listOfNotNull(
                        "log-scan",
                        LogScanParserDialog.collectParserArgs().toString()
                    ).toString()
                } else {
                    listOfNotNull(
                        "repo-scan",
                        RepoScanParserDialog.collectParserArgs().toString()
                    ).toString()
                }

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file? If empty, the result will be returned to stdOut",
                hint = "path/to/output/filename.cc.json"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            val isSilent: Boolean =
                KInquirer.promptConfirm(message = "Do you want to suppress command line output?", default = false)

            val addAuthor: Boolean =
                KInquirer.promptConfirm(message = "Do you want to add authors to every file?", default = false)

            return listOfNotNull(
                subcommand,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
