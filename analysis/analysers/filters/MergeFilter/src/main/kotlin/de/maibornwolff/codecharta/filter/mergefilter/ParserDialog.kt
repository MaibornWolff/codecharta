package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.interactiveparser.ParserDialogInterface
import de.maibornwolff.codecharta.analysers.tools.inquirer.InputType
import de.maibornwolff.codecharta.analysers.tools.inquirer.InputValidator
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.analysers.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(session: Session): List<String> {
            val inputDataName: String =
                session.myPromptDefaultFileFolderInput(
                    inputType = InputType.FOLDER_AND_FILE,
                    fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                    onInputReady = testCallback()
                )

            val defaultMerge = "Default merging..."
            val mimoMerge = "Mimo Merge"
            val largeMerge = "Large Merge"

            val mergeMode = session.myPromptList(
                message = "Do you want to use a special merge mode?",
                choices = listOf(defaultMerge, mimoMerge, largeMerge),
                onInputReady = testCallback()
            )

            val outputFileName: String
            val isCompressed: Boolean
            var levenshteinDistance = 0

            if (mergeMode == mimoMerge) {
                outputFileName = session.myPromptInput(
                    message = "What is the output folder path?",
                    hint = "Uses the current working directory if empty",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

                isCompressed = session.myPromptConfirm(
                    message = "Do you want to compress the output file(s)?",
                    onInputReady = testCallback()
                )

                levenshteinDistance = session.myPromptInputNumber(
                    message = "Select Levenshtein Distance for name match suggestions (0 for no suggestions)",
                    hint = "3",
                    invalidInputMessage = "Specify a number greater or equal to 0",
                    inputValidator = InputValidator.isNumberGreaterThen(-1),
                    onInputReady = testCallback()
                ).toInt()
            } else {
                outputFileName = session.myPromptInput(
                    message = "What is the name of the output file?",
                    hint = "mergeResult.cc.json",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

                isCompressed = (outputFileName.isEmpty()) || session.myPromptConfirm(
                    message = "Do you want to compress the output file?",
                    onInputReady = testCallback()
                )
            }

            val leafMergingStrategy = "Leaf Merging Strategy"
            val recursiveMergingStrategy = "Recursive Merging Strategy"
            val strategy = session.myPromptList(
                message = "Which merging strategy should be used?",
                choices = listOf(recursiveMergingStrategy, leafMergingStrategy),
                onInputReady = testCallback()
            )

            var leafFlag = false
            var addMissing = false
            if (strategy == leafMergingStrategy) {
                leafFlag = true
                addMissing = session.myPromptConfirm(
                    message = "Do you want to add missing nodes to reference?",
                    onInputReady = testCallback()
                )
            }

            val ignoreCase: Boolean =
                session.myPromptConfirm(
                    message = "Do you want to ignore case when checking node names?",
                    onInputReady = testCallback()
                )

            val basicMergeConfig = listOf(
                inputDataName,
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

        fun askForceMerge(session: Session): Boolean {
            return session.myPromptConfirm(
                message = "Do you still want to merge non-overlapping at the top-level nodes?",
                onInputReady = testCallback()
            )
        }

        fun askForMimoPrefix(session: Session, prefixOptions: Set<String>): String {
            return session.myPromptList(
                message = "Which prefix should be used for the output file?",
                choices = prefixOptions.toList(),
                onInputReady = testCallback()
            )
        }

        fun requestMimoFileSelection(session: Session, files: List<File>): List<File> {
            val fileNameList = files.map { it.name }
            val choiceList: List<String> = session.myPromptCheckbox(
                message = "",
                choices = fileNameList,
                hint = "Not selected files will not get merged",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            return files.filter { choiceList.contains(it.name) }
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
