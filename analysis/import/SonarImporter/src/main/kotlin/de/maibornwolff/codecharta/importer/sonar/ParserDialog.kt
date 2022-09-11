package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface

class ParserDialog {
    companion object : ParserDialogInterface {

        override fun collectParserArgs(): List<String> {
            val hostUrl = KInquirer.promptInput(
                message = "What is the sonar.host.url of your project?",
                hint = "https://sonar.foo"
            )

            val projectKey = KInquirer.promptInput(
                message = "What is the sonar.projectKey?",
                hint = "de.foo:bar"
            )

            val user: String = KInquirer.promptInput(
                message = "What is the sonar.login for connecting to the remote sonar instance?",
                hint = "c123d456"
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

            val mergeModules: Boolean =
                KInquirer.promptConfirm(
                    message = "Do you want to merge modules in multi-module projects?",
                    default = false
                )

            return listOfNotNull(
                hostUrl,
                projectKey,
                if (user.isEmpty()) null else "--user=$user",
                "--output-file=$outputFileName",
                if (metrics.isEmpty()) null else "--metrics=${eraseWhitespace(metrics)}",
                if (isCompressed) null else "--not-compressed",
                "--merge-modules=$mergeModules",
                                )
        }

        private fun eraseWhitespace(input: String) = input.replace(" ", "")
    }
}
