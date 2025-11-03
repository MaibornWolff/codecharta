package de.maibornwolff.codecharta.analysers.parsers.unified

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName = inputFileQuestion(session)

            val outputFileName = outputFileQuestion(session)

            val isCompressed = outputFileName.isEmpty() || compressedQuestion(session)

            val useGitignore = useGitignoreQuestion(session)

            val includeBuildFolders = if (!useGitignore) includeBuildFolderQuestion(session) else false

            val addCustomExclusions = addCustomExclusionsQuestion(session)

            val exclude = if (addCustomExclusions) excludeQuestion(session) else ""

            val limitFileExtensions = limitFileExtensionsQuestion(session)

            val fileExtensions = if (limitFileExtensions) includeFileExtensionsQuestion(session) else ""

            val verbose = verboseQuestion(session)

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=${!verbose}",
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

        private fun useGitignoreQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Exclude files specified in .gitignore files?",
                onInputReady = testCallback()
            )
        }

        private fun includeBuildFolderQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Include build folders (build, target, dist, out) and common resource folders " +
                    "(e.g. resources, node_modules, files starting with '.')?",
                onInputReady = testCallback()
            )
        }

        private fun addCustomExclusionsQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Add custom regex patterns to exclude files/folders?",
                onInputReady = testCallback()
            )
        }

        private fun excludeQuestion(session: Session): String {
            return session.promptInput(
                message = "Which regex patterns do you want to use to exclude files/folders from the analysis?",
                hint = "regex1, regex2... (comma-separated)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
        }

        private fun limitFileExtensionsQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Limit analysis to specific file extensions?",
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

        private fun verboseQuestion(session: Session): Boolean {
            return session.promptConfirm(
                message = "Do you want to suppress command line output?",
                onInputReady = testCallback()
            )
        }

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
