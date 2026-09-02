package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.SortBy
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.cli.StopWordLevel
import de.maibornwolff.codecharta.dialogProvider.InputType
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptDefaultDirectoryAssistedInput
import de.maibornwolff.codecharta.dialogProvider.promptInput
import de.maibornwolff.codecharta.dialogProvider.promptInputNumber
import de.maibornwolff.codecharta.dialogProvider.promptList

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val inputFileName = inputFileQuestion(session)

            val outputFileName = outputFileQuestion(session)
            val isCompressed = outputFileName.isEmpty() || compressedQuestion(session)
            val verbose = verboseQuestion(session)

            val useGitignore = useGitignoreQuestion(session)
            val excludeTests = excludeTestsQuestion(session)
            val ngrams = ngramsQuestion(session)
            val noSsr = ngrams > 1 && noSsrQuestion(session)
            val limit = limitQuestion(session)
            val sortBy = sortByQuestion(session)
            val stopWordLevel = stopWordLevelQuestion(session)
            val noTechnicalStopWords = noTechnicalStopWordsQuestion(session)
            val noTfidf = noTfidfQuestion(session)

            return listOfNotNull(
                inputFileName,
                "--output-file=$outputFileName",
                if (isCompressed) null else "--not-compressed",
                "--verbose=${!verbose}",
                if (useGitignore) null else "--bypass-gitignore",
                if (excludeTests) "--exclude-tests" else null,
                "--ngrams=$ngrams",
                if (noSsr) "--no-ssr" else null,
                if (limit.isNotEmpty()) "--limit=$limit" else null,
                "--sort-by=$sortBy",
                "--stop-word-level=$stopWordLevel",
                if (noTechnicalStopWords) "--no-technical-stopwords" else null,
                if (noTfidf) "--no-tfidf" else null
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

        private fun excludeTestsQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to exclude test files from the analysis?",
            onInputReady = testCallback()
        )

        private fun ngramsQuestion(session: Session): Int {
            val ngrams = session.promptInputNumber(
                message = "Up to which n-gram size should words be combined (1=words, 2=bigrams, 3=trigrams)?",
                hint = "1",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )
            return ngrams.toIntOrNull()?.takeIf { it >= 1 } ?: 1
        }

        private fun noSsrQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to disable Statistical Substring Reduction for n-grams?",
            onInputReady = testCallback()
        )

        private fun limitQuestion(session: Session): String = session.promptInputNumber(
            message = "How many top words should each node keep (leave empty to keep all)?",
            allowEmptyInput = true,
            onInputReady = testCallback()
        )

        private fun sortByQuestion(session: Session): String = session.promptList(
            message = "How do you want to sort the words?",
            choices = SortBy.entries.map { it.name },
            onInputReady = testCallback()
        )

        private fun stopWordLevelQuestion(session: Session): String = session.promptList(
            message = "Which technical stop word filtering level do you want to use?",
            choices = StopWordLevel.entries.map { it.name },
            onInputReady = testCallback()
        )

        private fun noTechnicalStopWordsQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to disable technical stop word filtering (e.g. 'test', 'util', 'handler')?",
            onInputReady = testCallback()
        )

        private fun noTfidfQuestion(session: Session): Boolean = session.promptConfirm(
            message = "Do you want to disable TF-IDF scoring?",
            onInputReady = testCallback()
        )

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
