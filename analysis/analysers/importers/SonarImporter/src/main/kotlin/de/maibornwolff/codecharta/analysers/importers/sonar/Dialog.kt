package de.maibornwolff.codecharta.analysers.importers.sonar

import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserDialogInterface
import de.maibornwolff.codecharta.dialogProvider.promptConfirm
import de.maibornwolff.codecharta.dialogProvider.promptInput

class Dialog {
    companion object : AnalyserDialogInterface {
        override fun collectAnalyserArgs(session: Session): List<String> {
            val hostUrl = session.promptInput(
                message = "What is the sonar.host.url of your project?",
                hint = "https://sonarcloud.io/",
                allowEmptyInput = false,
                invalidInputMessage = "Empty hostUrl is not allowed!",
                onInputReady = testCallback()
            )

            val projectKey = session.promptInput(
                message = "What is the sonar.projectKey?",
                hint = "Unique identifier of your project",
                allowEmptyInput = false,
                invalidInputMessage = "Empty projectKey is not allowed!",
                onInputReady = testCallback()
            )

            val userToken: String = session.promptInput(
                message = "What is the sonar user token (sonar.login) required to connect to the remote Sonar instance?",
                hint = "sqp_0a81f6490875e062f79ccdeace23ac3c68dac6e",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val outputFileName: String = session.promptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val metrics: String = session.promptInput(
                message = "What are the metrics to import (comma separated)?",
                hint = "metric1,metric2,metric3 (leave empty for all metrics)",
                allowEmptyInput = true,
                onInputReady = testCallback()
            )

            val isCompressed: Boolean = (outputFileName.isEmpty()) || session.promptConfirm(
                message = "Do you want to compress the output file?", onInputReady = testCallback()
            )

            val mergeModules: Boolean =
                session.promptConfirm(message = "Do you want to merge modules in multi-module projects?", onInputReady = testCallback())

            return listOfNotNull(
                hostUrl,
                projectKey,
                if (userToken.isEmpty()) null else "--user-token=$userToken",
                "--output-file=$outputFileName",
                if (metrics.isEmpty()) null else "--metrics=${eraseWhitespace(metrics)}",
                if (isCompressed) null else "--not-compressed",
                "--merge-modules=$mergeModules"
            )
        }

        private fun eraseWhitespace(input: String) = input.replace(" ", "")

        internal fun testCallback(): suspend RunScope.() -> Unit = {}
    }
}
