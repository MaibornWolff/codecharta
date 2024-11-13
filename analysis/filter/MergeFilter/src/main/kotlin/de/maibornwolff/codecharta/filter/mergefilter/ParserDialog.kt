package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import de.maibornwolff.codecharta.tools.interactiveparser.InputType
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.util.InputHelper
import java.io.File

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var inputFolderName: String
            do {
                inputFolderName = getInputFileName("cc.json", InputType.FOLDER)
            } while (!InputHelper.isInputValidAndNotNull(arrayOf(File(inputFolderName)), canInputContainFolders = true))

            val isMimoMode = KInquirer.promptConfirm(
                message = "Do you want to use MIMO mode? (multiple inputs multiple outputs)",
                default = false
            )

            var outputFileName = ""
            var isCompressed = false
            var levenshteinDistance = 0
            if (isMimoMode) {
                levenshteinDistance = KInquirer.promptInputNumber(
                    message = "Select Levenshtein Distance for name match suggestions (0 for no suggestions)",
                    default = "3"
                ).toInt()

                isCompressed = KInquirer.promptConfirm(
                    message = "Do you want to compress the output file(s)?",
                    default = true
                )
            } else {
                outputFileName =
                    KInquirer.promptInput(
                        message = "What is the name of the output file?"
                    )

                isCompressed =
                    (outputFileName.isEmpty()) ||
                    KInquirer.promptConfirm(
                        message = "Do you want to compress the output file?",
                        default = true
                    )
            }

            val leafMergingStrategy = "Leaf Merging Strategy"
            val recursiveMergingStrategy = "Recursive Merging Strategy"
            val strategy = KInquirer.promptList(
                message = "Which merging strategy should be used?",
                choices = listOf(recursiveMergingStrategy, leafMergingStrategy),
                hint = "Default is 'Recursive Merging Strategy'"
            )

            var leafFlag = false
            var addMissing = false
            if (strategy == leafMergingStrategy) {
                leafFlag = true
                addMissing = KInquirer.promptConfirm(
                    message = "Do you want to add missing nodes to reference?",
                    default = false
                )
            }

            val ignoreCase: Boolean =
                KInquirer.promptConfirm(
                    message = "Do you want to ignore case when checking node names?",
                    default = false
                )

            val basicMergeConfig = listOf(
                inputFolderName,
                "--add-missing=$addMissing",
                "--recursive=${!leafFlag}",
                "--leaf=$leafFlag",
                "--ignore-case=$ignoreCase",
                "--not-compressed=${!isCompressed}"
            )

            if (isMimoMode) {
                return basicMergeConfig + listOf(
                    "--mimo=true",
                    "--levenshtein-distance=$levenshteinDistance"
                )
            }
            return basicMergeConfig + listOf(
                "--output-file=$outputFileName"
            )
        }

        fun askForceMerge(): Boolean {
            return KInquirer.promptConfirm(
                message = "Do you still want to merge non-overlapping at the top-level nodes?",
                default = false
            )
        }

        fun askForFileCorrection(originalPrefix: String, suggestions: List<String>): String? {
            val choices = suggestions + "Skip"
            return KInquirer.promptList(
                message = "Did you mean one of these instead of $originalPrefix?",
                choices = choices
            ).takeIf { it != "Skip" }
        }
    }
}
