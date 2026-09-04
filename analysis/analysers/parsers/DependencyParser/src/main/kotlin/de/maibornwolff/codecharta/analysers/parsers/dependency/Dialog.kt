package de.maibornwolff.codecharta.analysers.parsers.dependency

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

            val useGitignore = useGitignoreQuestion(session)
            val includeTests = includeTestsQuestion(session)
            val omitGraphAnalysis = omitGraphAnalysisQuestion(session)
            val maxFileSizeKb = maxFileSizeQuestion(session)
            val fileTimeoutSeconds = fileTimeoutQuestion(session)

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=${!verbose}",
                if (useGitignore) null else "--bypass-gitignore",
                if (includeTests) "--include-tests" else null,
                if (omitGraphAnalysis) "--omit-graph-analysis" else null,
                if (maxFileSizeKb.isNotEmpty()) "--max-file-size=$maxFileSizeKb" else null,
                if (fileTimeoutSeconds.isNotEmpty()) "--file-timeout=$fileTimeoutSeconds" else null
            )
        }

        private fun inputFileQuestion(session: Session): String = session.promptDefaultDirectoryAssistedInput(
            inputType = InputType.FOLDER_AND_FILE,
            fileExtensionList = listOf(),
            onInputReady = testCallback()
        )

        private fun outputFileQuestion(session: Session): String = session.promptInput(
            message = "What is the name of the output file?",
            allowEmptyInput = true,
            onInputReady = testCallback()
        )

        private fun compressedQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to compress the output file?",
            onInputReady = testCallback()
        )

        private fun verboseQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to suppress command line output?",
            onInputReady = testCallback()
        )

        private fun useGitignoreQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Exclude files specified in .gitignore files?",
            onInputReady = testCallback()
        )

        private fun includeTestsQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to include test files in the analysis?",
            onInputReady = testCallback()
        )

        private fun omitGraphAnalysisQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to skip cycle detection and levelization (faster on very large projects)?",
            onInputReady = testCallback()
        )

        private fun maxFileSizeQuestion(session: Session): String = session.promptInputNumber(
            message = "Skip files of at least how many KB (leave empty for no limit)?",
            allowEmptyInput = true,
            onInputReady = testCallback()
        )

        private fun fileTimeoutQuestion(session: Session): String = session.promptInputNumber(
            message = "Give up on a file after how many seconds (leave empty for no timeout)?",
            allowEmptyInput = true,
            onInputReady = testCallback()
        )

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
