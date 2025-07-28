package de.maibornwolff.codecharta.analysers.parsers.unified

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptList

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName = inputFileQuestion(session)

            val outputFileName = outputFileQuestion(session)

            val isCompressed = outputFileName.isEmpty() || compressedQuestion(session)

            val askExcludeInclude = includeOrExcludeQuestion(session)

            val exclude = if (askExcludeInclude == "Only exclude" || askExcludeInclude == "Both") excludeQuestion(session) else ""

            val fileExtensions =
                if (askExcludeInclude == "Only include" || askExcludeInclude == "Both") includeFileExtensionsQuestion(session) else ""

            val includeBuildFolders = includeBuildFolderQuestion(session)

            val verbose = verboseQuestion(session)

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=${!verbose}",
                "--exclude=$exclude",
                "--file-extensions=$fileExtensions",
                if (includeBuildFolders) "--include-build-folders" else null
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

        private fun includeOrExcludeQuestion(session: Session): String {
            return session.promptList(
                message = "Do you want to exclude files/folders based on regex patterns or limit the analysis to specific file extensions?",
                choices = listOf(
                    "Only exclude",
                    "Only include",
                    "Both",
                    "None"
                ),
                onInputReady = testCallback()
            )
        }

        private fun excludeQuestion(session: Session): String {
            return session.promptInput(
                message = "Which regex patterns do you want to use to exclude files/folders from the analysis",
                hint = "regex1, regex2.. (leave empty if you don't want to exclude anything)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        private fun includeFileExtensionsQuestion(session: Session): String {
            return session.promptInput(
                message = "Which file extensions do you want to include in the analysis?",
                hint = "fileType1, fileType2... (leave empty to include all file-extensions)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        private fun includeBuildFolderQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to include build folders (build, target, dist, out) and common resource folders " +
                    "e.g. resources, node_modules or files/folders starting with '.'?",
                onInputReady = testCallback()
            )
        }

        private fun verboseQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
