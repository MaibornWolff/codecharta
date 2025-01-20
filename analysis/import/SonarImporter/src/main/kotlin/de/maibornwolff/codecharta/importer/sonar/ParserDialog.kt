package de.maibornwolff.codecharta.importer.sonar

import com.varabyte.kotter.foundation.session
import com.varabyte.kotter.runtime.RunScope
import com.varabyte.kotter.runtime.Session
import de.maibornwolff.codecharta.tools.inquirer.myPromptConfirm
import de.maibornwolff.codecharta.tools.inquirer.myPromptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {
        override fun collectParserArgs(): List<String> {
            var res = listOf<String>()
            session { res = myCollectParserArgs() }
            return res
        }

        internal fun Session.myCollectParserArgs(
            hostCallback: suspend RunScope.() -> Unit = {},
            projectCallback: suspend RunScope.() -> Unit = {},
            tokenCallback: suspend RunScope.() -> Unit = {},
            outFileCallback: suspend RunScope.() -> Unit = {},
            metricCallback: suspend RunScope.() -> Unit = {},
            compressCallback: suspend RunScope.() -> Unit = {},
            mergeCallback: suspend RunScope.() -> Unit = {}
        ): List<String> {
            val hostUrl = myPromptInput(
                message = "What is the sonar.host.url of your project?",
                hint = "https://sonarcloud.io/",
                allowEmptyInput = false,
                invalidInputMessage = "Empty hostUrl is not allowed!",
                onInputReady = hostCallback
            )

            val projectKey = myPromptInput(
                message = "What is the sonar.projectKey?",
                hint = "Unique identifier of your project",
                allowEmptyInput = false,
                invalidInputMessage = "Empty projectKey is not allowed!",
                onInputReady = projectCallback
            )

            val userToken: String = myPromptInput(
                message = "What is the sonar user token (sonar.login) required to connect to the remote Sonar instance?",
                hint = "sqp_0a81f6490875e062f79ccdeace23ac3c68dac6e",
                allowEmptyInput = true,
                onInputReady = tokenCallback
            )

            val outputFileName: String = myPromptInput(
                message = "What is the name of the output file?",
                allowEmptyInput = true,
                onInputReady = outFileCallback
            )

            val metrics: String = myPromptInput(
                message = "What are the metrics to import (comma separated)?",
                hint = "metric1,metric2,metric3 (leave empty for all metrics)",
                allowEmptyInput = true,
                onInputReady = metricCallback
            )

            val isCompressed: Boolean = (outputFileName.isEmpty()) || myPromptConfirm(
                message = "Do you want to compress the output file?", onInputReady = compressCallback
            )

            val mergeModules: Boolean =
                myPromptConfirm(message = "Do you want to merge modules in multi-module projects?", onInputReady = mergeCallback)

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
    }
}
