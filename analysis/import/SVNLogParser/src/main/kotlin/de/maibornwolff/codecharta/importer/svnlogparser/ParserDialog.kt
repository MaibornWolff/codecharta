package de.maibornwolff.codecharta.importer.svnlogparser

import com.github.kinquirer.KInquirer
import com.github.kinquirer.components.promptConfirm
import com.github.kinquirer.components.promptInput
import de.maibornwolff.codecharta.tools.interactiveparser.ParserDialogInterface
import mu.KotlinLogging

private val logger = KotlinLogging.logger {}

class ParserDialog {
    companion object : ParserDialogInterface {

        private const val EXTENSION = "log"
        private val extensionPattern = Regex(".($EXTENSION)$")

        override fun collectParserArgs(): List<String> {
            logger.info { "You can generate this file with: svn log --verbose > svn.log" }
            val defaultInputFileName = "svn.$EXTENSION"
            var inputFileName = KInquirer.promptInput(
                message = "What is the $EXTENSION file that has to be parsed?",
                hint = defaultInputFileName,
                default = defaultInputFileName
            )
            if (!extensionPattern.containsMatchIn(inputFileName))
                inputFileName += ".$EXTENSION"
            logger.info { "File path: $inputFileName" }

            val defaultOutputFileName = getOutputFileName(inputFileName)
            val outputFileName: String = KInquirer.promptInput(
                message = "What is the name of the output file?",
                hint = defaultOutputFileName,
                default = defaultOutputFileName
            )

            val isCompressed: Boolean =
                KInquirer.promptConfirm(message = "Do you want to compress the file?", default = false)

            val isSilent: Boolean =
                KInquirer.promptConfirm(message = "Do you want to suppress command line output?", default = false)

            val addAuthor: Boolean =
                KInquirer.promptConfirm(message = "Do you want to add authors to every file?", default = false)

            return listOf(
                inputFileName,
                "-o $outputFileName",
                "--not-compressed=$isCompressed",
                "--silent=$isSilent",
                "--add-author=$addAuthor"
            )
        }
    }
}
