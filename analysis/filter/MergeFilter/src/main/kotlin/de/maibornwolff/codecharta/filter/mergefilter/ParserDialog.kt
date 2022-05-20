package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "cc.json"

        override fun collectParserArgs(): List<String> {

            val inputFileName =
                KInquirer.promptInput(message = "What is the folder of $EXTENSION files that has to be merged?")

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?"
            )

            val isCompressed: Boolean =
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
                inputFileName,
                "-o $outputFileName",
                "--not-compressed=$isCompressed",
                "--add-missing=$addMissing",
                "--recursive=$recursive",
                "--leaf=$leaf",
                "--ignore-case=$ignoreCase"
            )
        }
    }
}
