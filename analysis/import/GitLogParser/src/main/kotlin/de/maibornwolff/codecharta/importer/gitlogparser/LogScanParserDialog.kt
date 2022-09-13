package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class LogScanParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            print("You can generate this file with: git log --numstat --raw --topo-order --reverse -m > git.log")
            val gitLogFile = KInquirer.promptInput(
                message = "What is the git.log file that has to be parsed?", hint = "path/to/git.log"
            )

            print("You can generate this file with: git ls-files > file-name-list.txt")
            val gitLsFile = KInquirer.promptInput(
                message = "What is the path to the file name list?", hint = "path/to/file-name-list.txt"
            )

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file? If empty, the result will be returned to stdOut",
                hint = "path/to/output/filename.cc.json"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?", default = true
            )

            val isSilent: Boolean =
                KInquirer.promptConfirm(message = "Do you want to suppress command line output?", default = false)

            val addAuthor: Boolean =
                KInquirer.promptConfirm(message = "Do you want to add authors to every file?", default = false)

            return listOfNotNull(
                "--git-log=$gitLogFile",
                "--repo-files=$gitLsFile",
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
