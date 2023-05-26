package de.maibornwolff.codecharta.importer.gitlogparser.subcommands

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.nio.file.Paths

class RepoScanParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {

            val repoPath = KInquirer.promptInput(
                message = "What is the root directory of the git project you want to parse? If empty, \".\" is assumed",
                default = Paths.get("").toAbsolutePath().toString()
            )

            return listOfNotNull(
                if (repoPath.isBlank()) null else "--repo-path=$repoPath"
            )
        }
    }
}
