package de.maibornwolff.codecharta.filter.mergefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptCheckboxObject
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import com.github.kinquirer.components.promptInputNumber
import com.github.kinquirer.components.promptList
import com.github.kinquirer.core.Choice
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

            val defaultMerge = "Default merging..."
            val mimoMerge = "Mimo Merge"
            val largeMerge = "Large Merge"
            val mergeMode = KInquirer.promptList(
                message = "Do you want to use a special merge mode?",
                choices = listOf(defaultMerge, mimoMerge, largeMerge)
            )

            val outputFileName: String
            val isCompressed: Boolean
            var levenshteinDistance = 0
            if (mergeMode == mimoMerge) {
                outputFileName = KInquirer.promptInput(
                    message = "What is the output folder path?",
                    hint = "Uses the current working directory if empty"
                )

                isCompressed = KInquirer.promptConfirm(
                    message = "Do you want to compress the output file(s)?",
                    default = true
                )

                levenshteinDistance = KInquirer.promptInputNumber(
                    message = "Select Levenshtein Distance for name match suggestions (0 for no suggestions)",
                    default = "3"
                ).toInt()
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
                "--not-compressed=$isCompressed",
                "--output-file=$outputFileName"
            )

            if (mergeMode == mimoMerge) {
                return basicMergeConfig + listOf(
                    "--mimo=true",
                    "--levenshtein-distance=$levenshteinDistance"
                )
            }

            if (mergeMode == largeMerge) {
                return basicMergeConfig + listOf(
                    "--large=true"
                )
            }

            return basicMergeConfig
        }

        fun askForceMerge(): Boolean {
            return KInquirer.promptConfirm(
                message = "Do you still want to merge non-overlapping at the top-level nodes?",
                default = false
            )
        }

        fun askForMimoPrefix(prefixOptions: Set<String>): String {
            return KInquirer.promptList(
                message = "Which prefix should be used for the output file?",
                choices = prefixOptions.toList()
            )
        }

        fun requestMimoFileSelection(files: List<File>): List<File> {
            val choiceList = files.map { Choice(it.name, it) }
            return KInquirer.promptCheckboxObject(
                message = "Which files should be merged? [Enter = Confirm, Space = Select]",
                choices = choiceList,
                hint = "Not selected files will not get merged",
                pageSize = 10
            )
        }
    }
}
