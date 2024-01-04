package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File
import java.nio.file.Paths

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {

            var inputFolderName = collectInputFileName()
            while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFolderName)), canInputContainFolders = true)) {
                inputFolderName = collectInputFileName()
            }

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            val addMissing: Boolean =
                KInquirer.promptConfirm(message = "Do you want to add missing nodes to reference?", default = false)

            val recursive: Boolean =
                KInquirer.promptConfirm(message = "Do you want to use recursive merge strategy?", default = true)

            val leaf: Boolean =
                KInquirer.promptConfirm(message = "Do you want to use leaf merging strategy?", default = false)

            val ignoreCase: Boolean =
                KInquirer.promptConfirm(
                    message = "Do you want to ignore case when checking node names?",
                    default = false
                )

            return listOf(
                inputFolderName,
                "--output-file=$outputFileName",
                "--not-compressed=$isCompressed",
                "--add-missing=$addMissing",
                "--recursive=$recursive",
                "--leaf=$leaf",
                "--ignore-case=$ignoreCase"
            )
        }

        private fun collectInputFileName(): String {
            return KInquirer.promptInput(message = "What is the folder of cc.json files that has to be merged?", default = Paths.get("").toAbsolutePath().toString())
        }
    }
}
