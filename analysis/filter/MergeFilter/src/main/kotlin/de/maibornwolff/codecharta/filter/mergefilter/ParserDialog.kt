package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {

            val inputFolderName =
                KInquirer.promptInput(message = "What is the folder of cc.json files that has to be merged?")

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?"
            )

            val compress: Boolean =
                KInquirer.promptConfirm(message = "Do you want to compress the file?", default = false)

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
                "--not-compressed=$compress",
                "--add-missing=$addMissing",
                "--recursive=$recursive",
                "--leaf=$leaf",
                "--ignore-case=$ignoreCase"
            )
        }
    }
}
