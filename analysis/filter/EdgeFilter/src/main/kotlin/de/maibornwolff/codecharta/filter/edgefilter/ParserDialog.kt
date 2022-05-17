package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "cc.json"
        private val extensionPattern = Regex(".($EXTENSION)$")

        override fun collectParserArgs(): List<String> {

            var inputFileName = KInquirer.promptInput(message = "What is the $EXTENSION file that has to be parsed?")
            if (!extensionPattern.containsMatchIn(inputFileName))
                inputFileName += ".$EXTENSION"
            logger.info { "File path: $inputFileName" }

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFileName,
                default = defaultOutputFileName
            )

            val defaultPathSeparator = "/"
            val pathSeparator: String = KInquirer.promptInput(
                message = "What is the path separator?",
                hint = defaultPathSeparator,
                default = defaultPathSeparator
            )

            return listOf(inputFileName, "-o $outputFileName", "--path-separator=$pathSeparator")
        }
    }
}
