package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.InputValidator
import de.maibornwolff.codecharta.dialogProvider.promptCheckbox
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultFileFolderInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber
import de.maibornwolff.codecharta.dialogProvider.promptList
import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileNames: String =
                session.promptDefaultFileFolderInput(
                    inputType = InputType.FOLDER_AND_FILE,
                    fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                    multiple = true,
                    onInputReady = testCallback()
                )

            val defaultMerge = "Default merging..."
            val mimoMerge = "Mimo Merge"
            val largeMerge = "Large Merge"

            val mergeMode = session.promptList(
                message = "Do you want to use a special merge mode?",
                choices = listOf(defaultMerge, mimoMerge, largeMerge),
                onInputReady = testCallback()
            )

            val outputFileName: String
            val isCompressed: Boolean
            var levenshteinDistance = 0

            if (mergeMode == mimoMerge) {
                outputFileName = session.promptInput(
                    message = "What is the output folder path?",
                    hint = "Uses the current working directory if empty",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

                isCompressed = session.promptConfirm(
                    message = "Do you want to compress the output file(s)?",
                    onInputReady = testCallback()
                )

                levenshteinDistance = session.promptInputNumber(
                    message = "Select Levenshtein Distance for name match suggestions (0 for no suggestions)",
                    hint = "3",
                    invalidInputMessage = "Specify a number greater or equal to 0",
                    inputValidator = InputValidator.isNumberGreaterThen(-1),
                    onInputReady = testCallback()
                ).toInt()
            } else {
                outputFileName = session.promptInput(
                    message = "What is the name of the output file?",
                    hint = "mergeResult.cc.json",
                    allowEmptyInput = true,
                    onInputReady = testCallback()
                )

                isCompressed = (outputFileName.isEmpty()) || session.promptConfirm(
                    message = "Do you want to compress the output file?",
                    onInputReady = testCallback()
                )
            }

            val leafMergingStrategy = "Leaf Merging Strategy"
            val recursiveMergingStrategy = "Recursive Merging Strategy"
            val strategy = session.promptList(
                message = "Which merging strategy should be used?",
                choices = listOf(recursiveMergingStrategy, leafMergingStrategy),
                onInputReady = testCallback()
            )

            var leafFlag = false
            var addMissing = false
            if (strategy == leafMergingStrategy) {
                leafFlag = true
                addMissing = session.promptConfirm(
                    message = "Do you want to add missing nodes to reference?",
                    onInputReady = testCallback()
                )
            }

            val ignoreCase: Boolean =
                session.promptConfirm(
                    message = "Do you want to ignore case when checking node names?",
                    onInputReady = testCallback()
                )

            val basicMergeConfig = inputFileNames.split(",").map { it.trim() } + listOf(
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
            return session.promptConfirm(
                message = "Do you still want to merge non-overlapping at the top-level nodes?",
                onInputReady = testCallback()
            )
        }

        fun askForMimoPrefix(session: Session, prefixOptions: Set<String>): String {
            return session.promptList(
                message = "Which prefix should be used for the output file?",
                choices = prefixOptions.toList(),
                onInputReady = testCallback()
            )
        }

        fun requestMimoFileSelection(session: Session, files: List<File>): List<File> {
            val fileNameList = files.map { it.name }
            val choiceList: List<String> = session.promptCheckbox(
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
