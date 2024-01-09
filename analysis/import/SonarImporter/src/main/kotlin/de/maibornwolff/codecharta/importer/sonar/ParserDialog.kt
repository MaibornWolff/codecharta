package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging

class ParserDialog {
    companion object : ParserDialogInterface {
    private val logger = KotlinLogging.logger {}

        override fun collectParserArgs(): List<String> {
            var hostUrl = collectHostUrl()
            while (hostUrl.isEmpty()) {
                logger.error("Empty hostUrl is not allowed!")
                hostUrl = collectHostUrl()
            }

            var projectKey = collectProjectKey()
            while (projectKey.isEmpty()) {
                logger.error("Empty projectKey is not allowed!")
                projectKey = collectProjectKey()
            }

            val userToken: String = KInquirer.promptInput(
                message = "What is the sonar user token (sonar.login) required to connect to the remote Sonar instance?",
                hint = "sqp_0a81f6490875e062f79ccdeace23ac3c68dac6e"
            )

            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
            )

            val metrics: String = KInquirer.promptInput(
                message = "What are the metrics to import (comma separated)?",
                hint = "metric1,metric2,metric3 (leave empty for all metrics)"
            )

            val isCompressed = (outputFileName.isEmpty()) || KInquirer.promptConfirm(
                message = "Do you want to compress the output file?",
                default = true
            )

            val mergeModules: Boolean = KInquirer.promptConfirm(
                    message = "Do you want to merge modules in multi-module projects?",
                    default = false
            )

            return listOfNotNull(
                hostUrl,
                projectKey,
                if (userToken.isEmpty()) null else "--user-token=$userToken",
                "--output-file=$outputFileName",
                if (metrics.isEmpty()) null else "--metrics=${eraseWhitespace(metrics)}",
                if (isCompressed) null else "--not-compressed",
                "--merge-modules=$mergeModules",
            )
        }

        private fun eraseWhitespace(input: String) = input.replace(" ", "")

        private fun collectHostUrl(): String {
            return KInquirer.promptInput(message = "What is the sonar.host.url of your project?", hint = "https://sonar.foo")
        }

        private fun collectProjectKey(): String {
            return KInquirer.promptInput(message = "What is the sonar.projectKey?", hint = "Unique identifier of your project")
        }
    }
}
