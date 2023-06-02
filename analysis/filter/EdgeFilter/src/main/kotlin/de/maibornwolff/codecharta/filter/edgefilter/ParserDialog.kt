package de.maibornwolff.codecharta.filter.edgefilter

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging
import java.io.File
import java.nio.file.Paths

private val logger = KotlinLogging.logger {}

class ParserDialog {
    companion object : ParserDialogInterface {
        private const val EXTENSION = "cc.json"

        override fun collectParserArgs(): List<String> {

            val inputFileName = KInquirer.promptInput(
                    message = "What is the $EXTENSION file that has to be parsed?",
                    hint = Paths.get("").toAbsolutePath().toString()) + File.separator + "yourInput." + EXTENSION
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

            return listOf(inputFileName, "--output-file=$outputFileName", "--path-separator=$pathSeparator")
        }
    }
}
