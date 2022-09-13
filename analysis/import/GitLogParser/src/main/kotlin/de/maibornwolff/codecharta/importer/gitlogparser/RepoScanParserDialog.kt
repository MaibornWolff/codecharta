package de.maibornwolff.codecharta.importer.gitlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class RepoScanParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {

            val repoPath = KInquirer.promptInput(
                message = "What is the root directory of the git project you want to parse? If empty, \".\" is assumed",
                hint = "path/to/repo/root"
            )

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
                if (repoPath.isBlank()) null else "--repo-path=$repoPath",
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
