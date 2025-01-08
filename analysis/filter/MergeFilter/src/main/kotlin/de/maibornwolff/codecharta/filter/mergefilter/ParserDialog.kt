package de.maibornwolff.codecharta.filter.mergefilter

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.tools.inquirer.InputType
import de.maibornwolff.codecharta.tools.inquirer.myPromptCheckbox
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptDefaultFileFolderInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.inquirer.myPromptInputNumber
import de.maibornwolff.codecharta.tools.inquirer.myPromptList
import de.maibornwolff.codecharta.tools.inquirer.util.InputValidator
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import java.io.File

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            fileCallback: suspend RunScope.() -> Unit = {},
            choiceCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {},
            levenshteinCallback: suspend RunScope.() -> Unit = {},
            strategyCallback: suspend RunScope.() -> Unit = {},
            addMissingCallback: suspend RunScope.() -> Unit = {},
            ignoreCaseCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val inputDataName: String =
                myPromptDefaultFileFolderInput(
                    allowEmptyInput = true,
                    inputType = InputType.FOLDER_AND_FILE,
                    fileExtensionList = listOf(FileExtension.CCJSON, FileExtension.CCGZ),
                    onInputReady = fileCallback
                )

            val defaultMerge = "Default merging..."
            val mimoMerge = "Mimo Merge"
            val largeMerge = "Large Merge"

            val mergeMode = myPromptList(
                message = "Do you want to use a special merge mode?",
                choices = listOf(defaultMerge, mimoMerge, largeMerge),
                onInputReady = choiceCallback
            )

            val outputFileName: String
            val isCompressed: Boolean
            var levenshteinDistance = 0

            if (mergeMode == mimoMerge) {
                outputFileName = myPromptInput(
                    message = "What is the output folder path?",
                    hint = "Uses the current working directory if empty",
                    allowEmptyInput = true,
                    onInputReady = outFileCallback
                )

                isCompressed = myPromptConfirm(
                    message = "Do you want to compress the output file(s)?",
                    onInputReady = compressCallback
                )

                levenshteinDistance = myPromptInputNumber(
                    message = "Select Levenshtein Distance for name match suggestions (0 for no suggestions)",
                    hint = "3",
                    invalidInputMessage = "Specify a number greater or equal to 0",
                    inputValidator = InputValidator.isNumberGreaterThen(-1),
                    onInputReady = levenshteinCallback
                ).toInt()
            } else {
                outputFileName = myPromptInput(
                    message = "What is the name of the output file?",
                    hint = "mergeResult.cc.json",
                    allowEmptyInput = true,
                    onInputReady = outFileCallback
                )

                isCompressed = (outputFileName.isEmpty()) || myPromptConfirm(
                    message = "Do you want to compress the output file?",
                    onInputReady = compressCallback
                )
            }

            val leafMergingStrategy = "Leaf Merging Strategy"
            val recursiveMergingStrategy = "Recursive Merging Strategy"
            val strategy = myPromptList(
                message = "Which merging strategy should be used?",
                choices = listOf(recursiveMergingStrategy, leafMergingStrategy),
                onInputReady = strategyCallback
            )

            var leafFlag = false
            var addMissing = false
            if (strategy == leafMergingStrategy) {
                leafFlag = true
                addMissing = myPromptConfirm(
                    message = "Do you want to add missing nodes to reference?",
                    onInputReady = addMissingCallback
                )
            }

            val ignoreCase: Boolean =
                myPromptConfirm(
                    message = "Do you want to ignore case when checking node names?",
                    onInputReady = ignoreCaseCallback
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
    }

    fun askForceMerge(forceCallback: suspend RunScope.() -> Unit = {}): Boolean {
        var force = false
        session {
            force = myPromptConfirm(
                message = "Do you still want to merge non-overlapping at the top-level nodes?",
                onInputReady = forceCallback
            )
        }
        return force
    }

    fun askForMimoPrefix(prefixOptions: Set<String>, prefixCallback: suspend RunScope.() -> Unit = {}): String {
        var prefix = ""
        session {
            prefix = myPromptList(
                message = "Which prefix should be used for the output file?",
                choices = prefixOptions.toList(),
                onInputReady = prefixCallback
            )
        }
        return prefix
    }

    fun requestMimoFileSelection(files: List<File>, fileSelectionCallback: suspend RunScope.() -> Unit = {}): List<File> {
        val fileNameList = files.map { it.name }

        var choiceList: List<String> = listOf()
        session {
            choiceList = myPromptCheckbox(
                message = "",
                choices = fileNameList,
                hint = "Not selected files will not get merged",
                allowEmptyInput = true,
                onInputReady = fileSelectionCallback
            )
        }

        return files.filter { choiceList.contains(it.name) }
    }
}
