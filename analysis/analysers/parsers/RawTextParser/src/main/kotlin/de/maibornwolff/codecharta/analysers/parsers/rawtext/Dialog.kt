package de.maibornwolff.codecharta.analysers.parsers.rawtext

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName = inputFileQuestion(session)

            val outputFileName = outputFileQuestion(session)

            val isCompressed = outputFileName.isEmpty() || compressedQuestion(session)

            val verbose = verboseQuestion(session)

            val metrics = metricsQuestion(session)

            val tabWidthValue = tabWidthQuestion(session)

            val maxIndentationLevel = maxIndentationLevelQuestion(session)

            val useGitignore = useGitignoreQuestion(session)

            val includeBuildFolders = if (!useGitignore) includeBuildFoldersQuestion(session) else false

            val exclude = excludeQuestion(session)

            val fileExtensions = fileExtensionsQuestion(session)

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=${!verbose}",
                "--metrics=$metrics",
                "--tab-width=$tabWidthValue",
                "--max-indentation-level=$maxIndentationLevel",
                "--exclude=$exclude",
                "--file-extensions=$fileExtensions",
                if (includeBuildFolders) "--include-build-folders" else null,
                if (!useGitignore) "--bypass-gitignore" else null
            )
        }

        private fun inputFileQuestion(session: Session): String {
            return session.promptDefaultDirectoryAssistedInput(
                inputType = InputType.FOLDER_AND_FILE,
                fileExtensionList = listOf(),
                onInputReady = testCallback()
            )
        }

        private fun outputFileQuestion(session: Session): String {
            return session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        private fun compressedQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to compress the output file?",
                onInputReady = testCallback()
            )
        }

        private fun verboseQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )
        }

        private fun metricsQuestion(session: Session): String {
            return session.promptInput(
                message = "What are the metrics to import (comma separated)?",
                hint = "metric1,metric2,metric3 (leave empty for all metrics)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        private fun tabWidthQuestion(session: Session): Int {
            val tabWidth = session.promptInputNumber(
                message = "How many spaces represent one indentation level when using spaces for indentation (estimated if empty)?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            return tabWidth.toIntOrNull() ?: 0
        }

        private fun maxIndentationLevelQuestion(session: Session): String {
            return session.promptInputNumber(
                message = "What is the maximum Indentation Level?",
                hint = "10",
                allowEmptyInput = false,
                onInputReady = testCallback()
            )
        }

        private fun useGitignoreQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Exclude files specified in .gitignore files?",
                onInputReady = testCallback()
            )
        }

        private fun includeBuildFoldersQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Include build folders (build, target, dist, out) and common resource folders " +
                    "(e.g. resources, node_modules, files starting with '.')?",
                onInputReady = testCallback()
            )
        }

        private fun excludeQuestion(session: Session): String {
            return session.promptInput(
                message = "Do you want to exclude file/folder according to regex pattern?",
                hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        private fun fileExtensionsQuestion(session: Session): String {
            return session.promptInput(
                message = "Do you only want to parse files with specific file-extensions?",
                hint = "fileType1, fileType2... (leave empty to include all file-extensions)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
