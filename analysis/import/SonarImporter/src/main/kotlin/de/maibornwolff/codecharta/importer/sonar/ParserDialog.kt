package de.maibornwolff.codecharta.importer.sonar

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

class ParserDialog {
    companion object : ParserDialogInterface {

        private const val EXTENSION = "svn"
        private val extensionPattern = Regex(".($EXTENSION)$")

        override fun collectParserArgs(): List<String> {
            val hostUrl = KInquirer.promptInput(
                message = "What is the sonar.host.url of your project_",
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
                hint = "metric1, metric2, metric3 (leave empty for all metrics)"
            )


            val compress: Boolean =
                KInquirer.promptConfirm(message = "Do you want to compress the file?", default = false)


            val mergeModules: Boolean =
                KInquirer.promptConfirm(message = "Do you want to merge modules in multi-module projects?", default = false)

            return listOf(
                hostUrl,
                projectKey,
                "--user=$user",
                "--output-file=$outputFileName",
                "--metrics=$metrics",
                "--not-compressed=$compress",
                "--merge-modules=$mergeModules",
            )
        }
    }
}
